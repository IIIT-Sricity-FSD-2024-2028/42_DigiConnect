import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../data/store';
import { Designation, OfficerUser } from '../models/department.model';
import { GovtService } from '../models/service.model';
import { User } from '../models/user.model';
import { Role } from '../models/enums';
import {
  CreateDesignationDto,
  OnboardOfficerDto,
} from './dto/create-designation.dto';
import {
  CreateDynamicServiceDto,
  ServiceFormFieldDto,
} from './dto/create-service.dto';

export interface ExtendedDynamicService {
  id: string;
  departmentId: string;
  stateId: string;
  name: string;
  code: string;
  description: string;
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  serviceFee: number;
  platformFee: number;
  totalFee: number;
  termsAndConditions: string;
  fields: ServiceFormFieldDto[];
  documentRequirements: any[];
  workflowSteps: any[];
  createdAt: string;
  updatedAt?: string;
}

@Injectable()
export class DepartmentHeadService {
  // Dedicated in-memory store for dynamic services (synchronized with centralized db)
  private dynamicServices: ExtendedDynamicService[] = db.dynamicServices as any;


  // ─────────────────────────────────────────────────────────────────────────────
  // DESIGNATIONS (Officer Roles without levels)
  // ─────────────────────────────────────────────────────────────────────────────
  listDesignations(departmentId: string): Designation[] {
    return db.designations.filter(
      (d) => !departmentId || d.departmentId === departmentId,
    );
  }

  createDesignation(dto: CreateDesignationDto): Designation {
    const dept = db.departments.find((d) => d.id === dto.departmentId);
    if (!dept) {
      throw new NotFoundException(`Department '${dto.departmentId}' does not exist.`);
    }

    const duplicate = db.designations.find(
      (d) =>
        d.departmentId === dto.departmentId &&
        (d.title.toLowerCase() === dto.title.trim().toLowerCase() ||
          d.code.toUpperCase() === dto.code.trim().toUpperCase()),
    );
    if (duplicate) {
      throw new ConflictException(
        `Designation '${dto.title}' or code '${dto.code}' already exists in this department.`,
      );
    }

    const newDesig: Designation = {
      id: `desig_${Date.now().toString().slice(-5)}`,
      departmentId: dto.departmentId,
      title: dto.title.trim(),
      code: dto.code.trim().toUpperCase(),
      description: dto.description || `${dto.title} for ${dept.name}`,
      createdAt: new Date().toISOString(),
    };
    db.designations.push(newDesig);
    return newDesig;
  }

  deleteDesignation(id: string): { success: boolean; message: string } {
    const desig = db.designations.find((d) => d.id === id);
    if (!desig) {
      throw new NotFoundException(`Designation '${id}' not found.`);
    }

    // Check if officers have this designation
    const hasOfficers = db.officers.some((o) => o.designationId === id);
    if (hasOfficers) {
      throw new BadRequestException(
        `Cannot delete designation '${desig.title}' because active officers are assigned to it.`,
      );
    }

    const index = db.designations.findIndex((d) => d.id === id);
    db.designations.splice(index, 1);
    return {
      success: true,
      message: `Designation '${desig.title}' deleted successfully.`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // OFFICER MANAGEMENT (Mapped to exact jurisdiction node)
  // ─────────────────────────────────────────────────────────────────────────────
  listOfficers(departmentId?: string): OfficerUser[] {
    return db.officers.filter(
      (o) => !departmentId || o.departmentId === departmentId,
    );
  }

  onboardOfficer(dto: OnboardOfficerDto): OfficerUser {
    const dept = db.departments.find((d) => d.id === dto.departmentId);
    if (!dept) {
      throw new NotFoundException(`Department '${dto.departmentId}' not found.`);
    }

    const desig = db.designations.find((d) => d.id === dto.designationId);
    if (!desig) {
      throw new NotFoundException(`Designation '${dto.designationId}' not found.`);
    }

    const node = db.jurisdictionNodes.find((n) => n.id === dto.assignedNodeId);
    if (!node) {
      throw new NotFoundException(`Jurisdiction node '${dto.assignedNodeId}' not found.`);
    }

    // Node must match state
    if (node.stateId !== dept.stateId) {
      throw new BadRequestException(
        `Jurisdiction node '${node.name}' belongs to state '${node.stateId}', but department belongs to '${dept.stateId}'.`,
      );
    }

    const officerId = `OFF-${desig.code}-${Date.now().toString().slice(-4)}`;

    const newOfficer: OfficerUser = {
      id: officerId,
      name: dto.name.trim(),
      email: dto.email.trim(),
      phone: dto.phone || '9876543200',
      departmentId: dto.departmentId,
      designationId: dto.designationId,
      designationTitle: desig.title,
      assignedNodeId: dto.assignedNodeId,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    db.officers.push(newOfficer);

    // Also register in users collection so they can login/switch role
    const userProfile: User = {
      id: officerId,
      name: newOfficer.name,
      email: newOfficer.email,
      phone: newOfficer.phone || '9876543200',
      aadhaar: '895421670000',
      role: Role.OFFICER,
      title: desig.title,
      dept: dept.name,
      jurisdiction: node.name,
      status: 'Active',
      joinedDate: new Date().toISOString(),
    };
    db.users.push(userProfile);

    // Audit Log
    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'OFFICER_ONBOARDED',
      actor: `Dept Head (${dept.name})`,
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Onboarded officer '${newOfficer.name}' as '${desig.title}' assigned to '${node.name}' (${node.tierLevel})`,
    });

    return newOfficer;
  }

  updateOfficerStatus(
    id: string,
    status: 'Active' | 'Suspended' | 'Inactive',
  ): OfficerUser {
    const officer = db.officers.find((o) => o.id === id);
    if (!officer) {
      throw new NotFoundException(`Officer '${id}' not found.`);
    }
    officer.status = status;

    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.status = status;
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: `OFFICER_${status.toUpperCase()}`,
      actor: 'Department Head',
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Officer '${officer.name}' status set to ${status}.`,
    });

    return officer;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DYNAMIC SERVICES & WORKFLOW ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  listServices(departmentId?: string, stateId?: string): ExtendedDynamicService[] {
    return this.dynamicServices.filter((s) => {
      const matchDept = !departmentId || s.departmentId === departmentId;
      const matchState = !stateId || s.stateId === stateId;
      return matchDept && matchState;
    });
  }

  getServiceById(id: string): ExtendedDynamicService {
    const service = this.dynamicServices.find((s) => s.id === id);
    if (!service) {
      throw new NotFoundException(`Service '${id}' not found.`);
    }
    return service;
  }

  createService(dto: CreateDynamicServiceDto): ExtendedDynamicService {
    const dept = db.departments.find((d) => d.id === dto.departmentId);
    if (!dept) {
      throw new NotFoundException(`Department '${dto.departmentId}' not found.`);
    }

    // Validate workflow designations exist
    for (const step of dto.workflowSteps) {
      const desig = db.designations.find((d) => d.id === step.requiredDesignationId);
      if (!desig) {
        throw new BadRequestException(
          `Workflow step ${step.stepNumber} references non-existent designation '${step.requiredDesignationId}'.`,
        );
      }
    }

    const sFee = Number(dto.serviceFee) || 0;
    const pFee = Number(dto.platformFee) || 0;

    const newService: ExtendedDynamicService = {
      id: `srv_${dto.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      departmentId: dto.departmentId,
      stateId: dto.stateId,
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      description: dto.description || `${dto.name} under ${dept.name}`,
      status: 'ACTIVE',
      serviceFee: sFee,
      platformFee: pFee,
      totalFee: sFee + pFee,
      termsAndConditions:
        dto.termsAndConditions ||
        'I hereby declare that all submitted information and uploaded documents are genuine.',
      fields: dto.fields,
      documentRequirements: dto.documentRequirements,
      workflowSteps: dto.workflowSteps,
      createdAt: new Date().toISOString(),
    };

    this.dynamicServices.push(newService);

    // Also mirror to db.services for backwards compatibility
    db.services.push({
      id: newService.id,
      name: newService.name,
      code: newService.code,
      dept: dept.name,
      departmentId: newService.departmentId,
      stateId: newService.stateId,
      description: newService.description,
      fee: newService.totalFee,
      serviceFee: newService.serviceFee,
      platformFee: newService.platformFee,
      totalFee: newService.totalFee,
      feeLabel: newService.totalFee === 0 ? 'Free' : `₹${newService.totalFee}`,
      status: 'Active',
      slaDays: 7,
      category: 'Certificate',
      requirements: dto.documentRequirements.map((d) => d.name),
      fields: newService.fields,
      documentRequirements: newService.documentRequirements,
      workflowSteps: newService.workflowSteps,
      stages: newService.workflowSteps?.length || 2,
    } as any);

    if (db.workflowConfig) {
      db.workflowConfig.push({
        id: newService.id,
        name: newService.name,
        code: newService.code,
        departmentId: newService.departmentId,
        stateId: newService.stateId,
        stages: newService.workflowSteps.map((st) => st.stepName),
        slaTotal: 15,
        steps: newService.workflowSteps,
      } as any);
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'SERVICE_CREATED',
      actor: `Dept Head (${dept.name})`,
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Created service '${newService.name}' with ${dto.fields.length} dynamic fields and ${dto.workflowSteps.length} workflow steps.`,
    });

    return newService;
  }

  updateServiceStatus(
    id: string,
    status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED',
  ): ExtendedDynamicService {
    const service = this.getServiceById(id);
    service.status = status;
    service.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: `SERVICE_STATUS_${status}`,
      actor: 'Department Head',
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Service '${service.name}' status updated to ${status}.`,
    });

    return service;
  }

  updateService(id: string, dto: CreateDynamicServiceDto): ExtendedDynamicService {
    const service = this.getServiceById(id);

    // Validate workflow designations exist
    if (dto.workflowSteps) {
      for (const step of dto.workflowSteps) {
        const desig = db.designations.find((d) => d.id === step.requiredDesignationId);
        if (!desig) {
          throw new BadRequestException(
            `Workflow step ${step.stepNumber} references non-existent designation '${step.requiredDesignationId}'.`,
          );
        }
      }
    }

    if (dto.name) service.name = dto.name.trim();
    if (dto.code) service.code = dto.code.trim().toUpperCase();
    if (dto.description !== undefined) service.description = dto.description;
    const sFee = dto.serviceFee !== undefined ? Number(dto.serviceFee) || 0 : service.serviceFee;
    const pFee = dto.platformFee !== undefined ? Number(dto.platformFee) || 0 : service.platformFee;
    service.serviceFee = sFee;
    service.platformFee = pFee;
    service.totalFee = sFee + pFee;
    if (dto.termsAndConditions !== undefined) service.termsAndConditions = dto.termsAndConditions;
    if (dto.fields) service.fields = dto.fields;
    if (dto.documentRequirements) service.documentRequirements = dto.documentRequirements;
    if (dto.workflowSteps) service.workflowSteps = dto.workflowSteps;
    service.updatedAt = new Date().toISOString();

    // Mirror update in db.services
    const dbSrv = db.services.find((s) => s.id === id) as any;
    if (dbSrv) {
      dbSrv.name = service.name;
      dbSrv.code = service.code;
      dbSrv.fee = service.totalFee;
      dbSrv.serviceFee = service.serviceFee;
      dbSrv.platformFee = service.platformFee;
      dbSrv.totalFee = service.totalFee;
      dbSrv.description = service.description;
      dbSrv.requirements = service.documentRequirements.map((d) => d.name);
      dbSrv.workflowSteps = service.workflowSteps;
      dbSrv.fields = service.fields;
      dbSrv.documentRequirements = service.documentRequirements;
      dbSrv.stages = service.workflowSteps?.length || 2;
    }

    const wf = (db.workflowConfig || []).find((w: any) => w.id === id);
    if (wf && service.workflowSteps) {
      wf.name = service.name;
      wf.stages = service.workflowSteps.map((st: any) => st.stepName);
      wf.steps = service.workflowSteps;
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'SERVICE_UPDATED',
      actor: 'Department Head',
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Updated service '${service.name}' (${service.code}).`,
    });

    return service;
  }

  deleteService(id: string): { success: boolean; message: string } {
    const idx = this.dynamicServices.findIndex((s) => s.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Service '${id}' not found.`);
    }
    const [removed] = this.dynamicServices.splice(idx, 1);

    const dbIdx = db.services.findIndex((s) => s.id === id);
    if (dbIdx >= 0) {
      db.services.splice(dbIdx, 1);
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'SERVICE_DELETED',
      actor: 'Department Head',
      role: 'DEPARTMENT_HEAD',
      date: new Date().toISOString(),
      details: `Deleted service '${removed.name}' (${removed.code}).`,
    });

    return { success: true, message: `Service '${removed.name}' deleted successfully.` };
  }

  getDepartmentAnalytics(deptId: string) {
    const dept = db.departments.find((d) => d.id === deptId);
    const services = this.dynamicServices.filter((s) => s.departmentId === deptId);
    const officers = db.officers.filter((o) => o.departmentId === deptId);
    const designations = db.designations.filter((d) => d.departmentId === deptId);

    const apps = db.applications.filter(
      (a) => (a as any).departmentId === deptId || a.dept === dept?.name,
    );

    const approved = apps.filter((a) => {
      const st = String(a.status || '').toLowerCase();
      return st.includes('approved') || st.includes('completed');
    });
    const rejected = apps.filter((a) => String(a.status || '').toLowerCase().includes('reject'));
    const queries = apps.filter((a) => String(a.status || '').toLowerCase().includes('query'));

    let totalRevenue = 0;
    let totalPlatformFee = 0;

    apps.forEach((a) => {
      const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
      if (isPaid) {
        const fee = Number(a.fee) || 0;
        totalRevenue += fee;
        const srv = services.find((s) => s.id === a.serviceId);
        const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
        totalPlatformFee += pFee;
      }
    });

    const totalServiceFee = Math.max(0, totalRevenue - totalPlatformFee);

    return {
      departmentName: dept?.name || 'Department',
      totalServices: services.length,
      activeServices: services.filter((s) => s.status === 'ACTIVE').length,
      inactiveServices: services.filter((s) => s.status !== 'ACTIVE').length,
      totalDesignations: designations.length,
      totalOfficers: officers.length,
      totalApplications: apps.length,
      approvedApplications: approved.length,
      rejectedApplications: rejected.length,
      pendingQueries: queries.length,
      totalRevenue,
      totalPlatformFee,
      totalServiceFee,
    };
  }

  getDepartmentRevenue(deptId: string) {
    const dept = db.departments.find((d) => d.id === deptId);
    const services = [
      ...this.dynamicServices.filter((s) => s.departmentId === deptId),
      ...(db.services || []).filter((s) => (s as any).departmentId === deptId || s.dept === dept?.name),
    ];
    // Deduplicate services by id
    const uniqueServices = Array.from(new Map(services.map((s) => [s.id, s])).values());

    const apps = db.applications.filter(
      (a) => (a as any).departmentId === deptId || a.dept === dept?.name,
    );

    let totalRevenue = 0;
    let totalPlatformFee = 0;
    let totalServiceFee = 0;
    let paidTransactionsCount = 0;

    const paidApps: any[] = [];

    apps.forEach((a) => {
      const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
      const fee = Number(a.fee) || 0;
      const srv = uniqueServices.find((s) => s.id === a.serviceId);
      const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
      const sFee = Math.max(0, fee - pFee);

      if (isPaid) {
        paidTransactionsCount++;
        totalRevenue += fee;
        totalPlatformFee += pFee;
        totalServiceFee += sFee;
        paidApps.push({
          id: a.id,
          serviceId: a.serviceId,
          serviceName: a.serviceName,
          citizenName: a.citizenName,
          fee,
          platformFee: pFee,
          serviceFee: sFee,
          paymentStatus: a.paymentStatus,
          paymentMethod: a.paymentMethod || 'Online Payment (UPI/Card)',
          paymentTransactionId: a.paymentTransactionId || `TXN-${a.id.replace('APP-', '')}`,
          date: a.submittedDate || a.appliedDate || (a as any).createdAt || new Date().toISOString(),
          status: a.status,
        });
      }
    });

    // Breakdown per service
    const serviceBreakdown = uniqueServices.map((srv) => {
      const srvApps = apps.filter((a) => a.serviceId === srv.id);
      const srvPaidApps = srvApps.filter((a) => ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase()));
      const fee = Number(srv.totalFee) || Number((srv as any).fee) || 0;
      const sFee = srv.serviceFee !== undefined ? Number(srv.serviceFee) : Math.round(fee * 0.85);
      const pFee = srv.platformFee !== undefined ? Number(srv.platformFee) : Math.round(fee * 0.15);

      const totalCollected = srvPaidApps.reduce((sum, a) => sum + (Number(a.fee) || fee), 0);
      const platformCollected = srvPaidApps.length * pFee;
      const serviceCollected = Math.max(0, totalCollected - platformCollected);

      return {
        serviceId: srv.id,
        serviceName: srv.name,
        code: srv.code,
        category: (srv as any).category || (srv as any).cat || 'General',
        totalApplications: srvApps.length,
        paidApplications: srvPaidApps.length,
        serviceFee: sFee,
        platformFee: pFee,
        totalFee: fee,
        totalCollected,
        platformCollected,
        serviceCollected,
      };
    });

    return {
      departmentId: deptId,
      departmentName: dept?.name || 'Department',
      stateId: dept?.stateId || '',
      totalRevenue,
      totalPlatformFee,
      totalServiceFee,
      paidTransactionsCount,
      totalApplications: apps.length,
      serviceBreakdown,
      transactions: paidApps,
      generatedAt: new Date().toISOString(),
    };
  }
}
