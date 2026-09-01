import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../data/store';
import { Department } from '../models/department.model';
import { User } from '../models/user.model';
import { Role, AppStatus, GrievanceStatus } from '../models/enums';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/create-department.dto';
import { ConfigureGrievanceCellDto } from './dto/create-grievance-cell.dto';
import { CentralService } from '../central/central.service';

export interface GrievanceCellConfig {
  id: string;
  stateId: string;
  departmentId: string;
  cellName: string;
  jurisdictionTier?: string;
  slaDays?: number;
  workflowSteps: {
    stepNumber: number;
    roleTitle: string;
    jurisdictionTier: string;
    assignedOfficerId?: string;
  }[];
  createdAt: string;
}

@Injectable()
export class StateAdminService {
  constructor(private readonly centralService: CentralService) {}

  // In-memory store for department grievance cells across all 4 states
  private grievanceCells: GrievanceCellConfig[] = [
    // ── AP GRIEVANCE CELLS ──
    {
      id: 'cell_dept_rev_ap',
      stateId: 'state_ap',
      departmentId: 'dept_rev_ap',
      cellName: 'Revenue Department Grievance Redressal Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'Sub-Division Grievance Officer', jurisdictionTier: 'SUB_DIVISION', assignedOfficerId: 'OFF-AP-REV-GRV1-01' },
        { stepNumber: 2, roleTitle: 'District Grievance Officer', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-AP-REV-GRV2-01' },
        { stepNumber: 3, roleTitle: 'State Appellate Authority', jurisdictionTier: 'STATE', assignedOfficerId: 'USR-DH-REV-AP' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cell_dept_wel_ap',
      stateId: 'state_ap',
      departmentId: 'dept_wel_ap',
      cellName: 'Social Welfare Grievance Redressal Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'District Welfare Grievance Officer', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-AP-WEL-GRV1-01' },
        { stepNumber: 2, roleTitle: 'State Welfare Appellate Authority', jurisdictionTier: 'STATE', assignedOfficerId: 'OFF-AP-WEL-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },

    // ── KA GRIEVANCE CELLS ──
    {
      id: 'cell_dept_rev_ka',
      stateId: 'state_ka',
      departmentId: 'dept_rev_ka',
      cellName: 'Revenue Department (Kandaya Ilakhe) Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'Taluk Grievance Officer', jurisdictionTier: 'SUB_DIVISION', assignedOfficerId: 'OFF-KA-REV-GRV1-01' },
        { stepNumber: 2, roleTitle: 'District Grievance Authority', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-KA-REV-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cell_dept_wel_ka',
      stateId: 'state_ka',
      departmentId: 'dept_wel_ka',
      cellName: 'Social Welfare & Backward Classes Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'District Welfare Grievance Officer', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-KA-WEL-GRV1-01' },
        { stepNumber: 2, roleTitle: 'State Welfare Appellate Authority', jurisdictionTier: 'STATE', assignedOfficerId: 'OFF-KA-WEL-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },

    // ── KL GRIEVANCE CELLS ──
    {
      id: 'cell_dept_rev_kl',
      stateId: 'state_kl',
      departmentId: 'dept_rev_kl',
      cellName: 'Revenue Department (Keralam E-District) Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'Taluk Grievance Officer', jurisdictionTier: 'SUB_DIVISION', assignedOfficerId: 'OFF-KL-REV-GRV1-01' },
        { stepNumber: 2, roleTitle: 'District Collectorate Appellate Authority', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-KL-REV-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cell_dept_wel_kl',
      stateId: 'state_kl',
      departmentId: 'dept_wel_kl',
      cellName: 'Social Justice & Empowerment Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'District Social Justice Officer', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-KL-WEL-GRV1-01' },
        { stepNumber: 2, roleTitle: 'Directorate Appellate Authority', jurisdictionTier: 'STATE', assignedOfficerId: 'OFF-KL-WEL-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },

    // ── TN GRIEVANCE CELLS ──
    {
      id: 'cell_dept_rev_tn',
      stateId: 'state_tn',
      departmentId: 'dept_rev_tn',
      cellName: 'Revenue & Disaster Management (e-Sevai) Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'Taluk Grievance Officer', jurisdictionTier: 'SUB_DIVISION', assignedOfficerId: 'OFF-TN-REV-GRV1-01' },
        { stepNumber: 2, roleTitle: 'District Revenue Officer (DRO)', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-TN-REV-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cell_dept_wel_tn',
      stateId: 'state_tn',
      departmentId: 'dept_wel_tn',
      cellName: 'Adi Dravidar & Tribal Welfare Grievance Cell',
      jurisdictionTier: 'DISTRICT',
      slaDays: 7,
      workflowSteps: [
        { stepNumber: 1, roleTitle: 'District Welfare Grievance Officer', jurisdictionTier: 'DISTRICT', assignedOfficerId: 'OFF-TN-WEL-GRV1-01' },
        { stepNumber: 2, roleTitle: 'State Directorate Appellate Authority', jurisdictionTier: 'STATE', assignedOfficerId: 'OFF-TN-WEL-GRV2-01' },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  /**
   * List departments in a state.
   */
  /**
   * List departments in a state with comprehensive metrics.
   */
  listDepartments(stateId: string) {
    return db.departments
      .filter((d) => !stateId || d.stateId === stateId)
      .map((dept) => {
        const head = db.users.find((u) => u.id === dept.headUserId);
        const servicesCount = (db.services || []).filter((s) => (s as any).departmentId === dept.id || s.dept === dept.name).length +
          ((db as any).dynamicServices || []).filter((s: any) => s.departmentId === dept.id).length;
        const officersCount = (db.officers || []).filter((o) => o.departmentId === dept.id).length;
        const applicationsCount = (db.applications || []).filter((a) => (a as any).departmentId === dept.id || a.dept === dept.name).length;
        const grievancesCount = (db.grievances || []).filter((g) => (g as any).departmentId === dept.id || (g as any).dept === dept.name).length;
        const designationsCount = (db.designations || []).filter((d) => d.departmentId === dept.id).length;
        const grievanceCell = this.grievanceCells.find((c) => c.departmentId === dept.id);

        return {
          ...dept,
          headUser: head ? { id: head.id, name: head.name, email: head.email, phone: head.phone } : null,
          headName: head ? head.name : null,
          headEmail: head ? head.email : null,
          servicesCount,
          officersCount,
          applicationsCount,
          grievancesCount,
          designationsCount,
          hasGrievanceCell: !!grievanceCell,
          grievanceCellName: grievanceCell ? grievanceCell.cellName : null,
        };
      });
  }

  /**
   * Get single department by ID with detailed inspect stats.
   */
  getDepartmentById(id: string): any {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    const head = db.users.find((u) => u.id === dept.headUserId);
    const services = [
      ...(db.services || []).filter((s) => (s as any).departmentId === dept.id || s.dept === dept.name),
      ...((db as any).dynamicServices || []).filter((s: any) => s.departmentId === dept.id),
    ];
    const officers = (db.officers || []).filter((o) => o.departmentId === dept.id);
    const applications = (db.applications || []).filter((a) => (a as any).departmentId === dept.id || a.dept === dept.name);
    const grievances = (db.grievances || []).filter((g) => (g as any).departmentId === dept.id || (g as any).dept === dept.name);
    const designations = (db.designations || []).filter((d) => d.departmentId === dept.id);
    const grievanceCell = this.grievanceCells.find((c) => c.departmentId === dept.id);
    const state = db.states.find((s) => s.id === dept.stateId);

    return {
      ...dept,
      stateName: state ? state.name : dept.stateId,
      headUser: head ? { id: head.id, name: head.name, email: head.email, phone: head.phone } : null,
      headName: head ? head.name : null,
      headEmail: head ? head.email : null,
      metrics: {
        servicesCount: services.length,
        officersCount: officers.length,
        applicationsCount: applications.length,
        grievancesCount: grievances.length,
        designationsCount: designations.length,
      },
      hasGrievanceCell: !!grievanceCell,
      grievanceCell: grievanceCell || null,
    };
  }

  /**
   * State Admin creates department and appoints Department Head.
   */
  createDepartment(dto: CreateDepartmentDto): Department {
    const state = db.states.find((s) => s.id === dto.stateId);
    if (!state) {
      throw new NotFoundException(`State '${dto.stateId}' does not exist.`);
    }

    const duplicate = db.departments.find(
      (d) =>
        d.stateId === dto.stateId &&
        (d.name.toLowerCase() === dto.name.trim().toLowerCase() ||
          d.code.toUpperCase() === dto.code.trim().toUpperCase()),
    );
    if (duplicate) {
      throw new ConflictException(
        `A department with name '${dto.name}' or code '${dto.code}' already exists in this state.`,
      );
    }

    const deptId = `dept_${dto.code.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const headUserId = `USR-DH-${Date.now().toString().slice(-4)}`;

    // Create Department Head User
    const headUser: User = {
      id: headUserId,
      name: dto.headUserName || `${dto.name} Department Head`,
      email: dto.headUserEmail || `head.${dto.code.toLowerCase()}@${state.code.toLowerCase()}.gov.in`,
      phone: '9876543201',
      aadhaar: '895421670001',
      role: Role.DEPARTMENT_HEAD,
      dept: dto.name.trim(),
      state: state.name,
      status: 'Active',
      joinedDate: new Date().toISOString(),
    };
    db.users.push(headUser);

    const newDept: Department = {
      id: deptId,
      stateId: dto.stateId,
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      description: dto.description || `${dto.name} Line Department for ${state.name}`,
      headUserId: headUserId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.departments.push(newDept);

    // Auto-create default Grievance Cell for this department
    const grievanceCell: GrievanceCellConfig = {
      id: `cell_${deptId}`,
      stateId: dto.stateId,
      departmentId: deptId,
      cellName: `${dto.name} Grievance Redressal Cell`,
      workflowSteps: [
        {
          stepNumber: 1,
          roleTitle: `${dto.name} District Grievance Officer`,
          jurisdictionTier: 'DISTRICT',
        },
        {
          stepNumber: 2,
          roleTitle: `${dto.name} State Appellate Authority`,
          jurisdictionTier: 'STATE',
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.grievanceCells.push(grievanceCell);

    // Audit Log
    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'DEPARTMENT_CREATED',
      actor: `State Admin (${state.code})`,
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Created department '${newDept.name}' and initialized default grievance cell.`,
    });

    return newDept;
  }

  /**
   * Update department name, code, description, or head assignment.
   */
  updateDepartment(id: string, dto: UpdateDepartmentDto): Department {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    if (dto.name) dept.name = dto.name.trim();
    if (dto.code) dept.code = dto.code.trim().toUpperCase();
    if (dto.description !== undefined) dept.description = dto.description;
    if (dto.status) dept.status = dto.status as any;

    if (dto.headUserId) {
      dept.headUserId = dto.headUserId;
    }

    if (dto.headUserName || dto.headUserEmail) {
      let head = db.users.find((u) => u.id === dept.headUserId);
      if (!head) {
        const headUserId = `USR-DH-${Date.now().toString().slice(-4)}`;
        head = {
          id: headUserId,
          name: dto.headUserName || `${dept.name} Department Head`,
          email: dto.headUserEmail || `head.${dept.code.toLowerCase()}@gov.in`,
          phone: '9876543201',
          aadhaar: '895421670001',
          role: Role.DEPARTMENT_HEAD,
          dept: dept.name,
          status: 'Active',
          joinedDate: new Date().toISOString(),
        };
        db.users.push(head);
        dept.headUserId = headUserId;
      } else {
        if (dto.headUserName) head.name = dto.headUserName.trim();
        if (dto.headUserEmail) head.email = dto.headUserEmail.trim();
      }
    }

    dept.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'DEPARTMENT_UPDATED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Updated details for department '${dept.name}'.`,
    });

    return dept;
  }

  /**
   * Change department status (ACTIVE / SUSPENDED / INACTIVE).
   */
  updateDepartmentStatus(id: string, status: string): Department {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    dept.status = status as any;
    dept.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: `DEPARTMENT_${status.toUpperCase()}`,
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Department '${dept.name}' status changed to '${status}'.`,
    });

    return dept;
  }

  /**
   * Assign or change Department Head.
   */
  assignDepartmentHead(id: string, name: string, email: string): Department {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    let headUser = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!headUser) {
      const headUserId = `USR-DH-${Date.now().toString().slice(-4)}`;
      const newHead: User = {
        id: headUserId,
        name: name.trim(),
        email: email.trim(),
        phone: '9876543201',
        aadhaar: '895421670001',
        role: Role.DEPARTMENT_HEAD,
        dept: dept.name,
        status: 'Active',
        joinedDate: new Date().toISOString(),
      };
      db.users.push(newHead);
      headUser = newHead;
    } else {
      headUser.name = name.trim();
      headUser.role = Role.DEPARTMENT_HEAD;
      headUser.dept = dept.name;
    }

    dept.headUserId = headUser.id;
    dept.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'DEPARTMENT_HEAD_ASSIGNED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Assigned '${headUser.name}' (${headUser.email}) as Head of Department '${dept.name}'.`,
    });

    return dept;
  }

  /**
   * Remove Department Head relationship without deleting user.
   */
  removeDepartmentHead(id: string): Department {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    const previousHeadId = dept.headUserId;
    dept.headUserId = undefined;
    dept.updatedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'DEPARTMENT_HEAD_REMOVED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Removed Department Head association from '${dept.name}'.`,
    });

    return dept;
  }

  /**
   * Delete department with dependency check protection.
   */
  deleteDepartment(id: string): { success: boolean; message: string; details?: any } {
    const dept = db.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Department '${id}' not found.`);
    }

    // Comprehensive dependency audit
    const services = [
      ...(db.services || []).filter((s) => (s as any).departmentId === id || s.dept === dept.name),
      ...((db as any).dynamicServices || []).filter((s: any) => s.departmentId === id),
    ];
    const officers = (db.officers || []).filter((o) => o.departmentId === id);
    const applications = (db.applications || []).filter((a) => (a as any).departmentId === id || a.dept === dept.name);
    const grievances = (db.grievances || []).filter((g) => (g as any).departmentId === id || (g as any).dept === dept.name);

    if (services.length > 0 || officers.length > 0 || applications.length > 0 || grievances.length > 0) {
      throw new BadRequestException(
        `Cannot delete department '${dept.name}' because historical/operational records depend on it: ` +
          `${services.length} services, ${officers.length} officers, ${applications.length} applications, ${grievances.length} grievances. ` +
          `Please suspend/deactivate the department instead to preserve audit integrity.`,
      );
    }

    const index = db.departments.findIndex((d) => d.id === id);
    if (index >= 0) {
      db.departments.splice(index, 1);
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'DEPARTMENT_DELETED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Deleted department '${dept.name}' (${dept.id}).`,
    });

    return {
      success: true,
      message: `Department '${dept.name}' deleted successfully.`,
    };
  }

  /**
   * State Admin configures Grievance Cell & Grievance Workflow for a department.
   * Section 23: Each department has one grievance cell and workflow.
   */
  configureGrievanceCell(dto: ConfigureGrievanceCellDto): GrievanceCellConfig {
    const tier = dto.jurisdictionTier || 'DISTRICT';
    const sla = dto.slaDays || 7;
    const dept = db.departments.find((d) => d.id === dto.departmentId);
    const deptName = dept?.name || dto.deptName || dto.cellName;

    const defaultSteps =
      tier === 'SUB_DIVISION'
        ? [
            { stepNumber: 1, roleTitle: `${deptName} Sub-Division Grievance Officer`, jurisdictionTier: 'SUB_DIVISION' },
            { stepNumber: 2, roleTitle: `${deptName} District Grievance Officer`, jurisdictionTier: 'DISTRICT' },
            { stepNumber: 3, roleTitle: `${deptName} State Appellate Authority`, jurisdictionTier: 'STATE' },
          ]
        : tier === 'STATE'
        ? [
            { stepNumber: 1, roleTitle: `${deptName} State Grievance Redressal Authority`, jurisdictionTier: 'STATE' },
          ]
        : [
            { stepNumber: 1, roleTitle: `${deptName} District Grievance Officer`, jurisdictionTier: 'DISTRICT' },
            { stepNumber: 2, roleTitle: `${deptName} State Appellate Authority`, jurisdictionTier: 'STATE' },
          ];

    const steps = dto.workflowSteps && dto.workflowSteps.length > 0 ? dto.workflowSteps : defaultSteps;

    let cell = this.grievanceCells.find((c) => c.departmentId === dto.departmentId);
    if (cell) {
      cell.cellName = dto.cellName.trim();
      cell.jurisdictionTier = tier;
      cell.slaDays = sla;
      cell.workflowSteps = steps;
    } else {
      cell = {
        id: `cell_${dto.departmentId}`,
        stateId: dto.stateId,
        departmentId: dto.departmentId,
        cellName: dto.cellName.trim(),
        jurisdictionTier: tier,
        slaDays: sla,
        workflowSteps: steps,
        createdAt: new Date().toISOString(),
      };
      this.grievanceCells.push(cell);
    }

    if (dept) {
      (dept as any).hasGrievanceCell = true;
      (dept as any).grievanceCellName = cell.cellName;
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'GRIEVANCE_CELL_CONFIGURED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Configured grievance cell '${cell.cellName}' for department '${deptName}'.`,
    });

    return cell;
  }

  getGrievanceCellByDepartment(deptId: string): GrievanceCellConfig | undefined {
    return this.grievanceCells.find((c) => c.departmentId === deptId);
  }

  /**
   * List all grievance cells for a state.
   * Only returns cells whose department actually exists in the state.
   */
  listGrievanceCells(stateId: string): (GrievanceCellConfig & { deptName: string; slaDays: number; jurisdictionTier: string; workflowSummary: string; status: string })[] {
    const stateDepts = db.departments.filter((d) => !stateId || d.stateId === stateId);
    const deptIds = new Set(stateDepts.map((d) => d.id));

    return this.grievanceCells
      .filter((c) => !stateId || (c.stateId === stateId && deptIds.has(c.departmentId)))
      .map((c) => {
        const dept = stateDepts.find((d) => d.id === c.departmentId);
        return {
          ...c,
          deptName: dept?.name || c.departmentId,
          slaDays: c.slaDays || 7,
          jurisdictionTier: c.jurisdictionTier || (c.workflowSteps?.length > 0 ? c.workflowSteps[c.workflowSteps.length - 1].jurisdictionTier : 'DISTRICT'),
          workflowSummary: c.workflowSteps?.map((s) => s.roleTitle).join(' ➔ ') || 'District Grievance Officer ➔ State Appellate Authority',
          status: 'ACTIVE',
        };
      });
  }

  /**
   * Complete Monitoring Details for State Admin Dashboard (Unified with Central Admin)
   */
  getStateDashboard(stateId: string) {
    return this.centralService.getStateDetails(stateId);
  }

  /**
   * Department-wise revenue analysis for a state (Derived from shared state details).
   */
  getDepartmentRevenue(stateId: string) {
    const details = this.centralService.getStateDetails(stateId);
    const breakdown = (details.departments || []).map((d: any) => ({
      departmentId: d.id,
      departmentName: d.name,
      departmentCode: d.code,
      totalApplications: d.applicationsCount || 0,
      paidApplications: d.completedCount || d.applicationsCount || 0,
      totalRevenue: d.revenue || 0,
      platformFee: d.platformFee || 0,
      serviceFee: d.serviceFee !== undefined ? d.serviceFee : (d.revenue || 0),
    }));

    return {
      stateId,
      totalStateRevenue: details.summary.totalRevenue,
      totalStatePlatformFee: details.summary.platformFees || 0,
      totalStateServiceFee: details.summary.serviceFees || details.summary.totalRevenue,
      departmentBreakdown: breakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * State Admin Dashboard KPIs (Derived from shared state details).
   */
  getStateAnalytics(stateId: string) {
    const details = this.centralService.getStateDetails(stateId);
    const revData = this.getDepartmentRevenue(stateId);

    return {
      totalJurisdictions: (details.jurisdiction.districtsCount || 0) + (details.jurisdiction.mandalsCount || 0),
      totalDepartments: details.summary.totalDepartments,
      totalOfficers: details.summary.totalOfficers,
      totalApplications: details.summary.totalApplications,
      totalRevenue: details.summary.totalRevenue,
      totalGrievances: details.summary.totalGrievances,
      pendingGrievances: details.grievances.pending,
      revenueBreakdown: revData.departmentBreakdown,
    };
  }
}
