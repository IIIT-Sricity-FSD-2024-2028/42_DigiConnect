import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../data/store';
import { StateGovernment } from '../models/state.model';
import { JurisdictionNode } from '../models/jurisdiction.model';
import { User } from '../models/user.model';
import { Role } from '../models/enums';
import { CreateStateDto } from './dto/create-state.dto';

const SEED_STATE_METRICS: Record<string, {
  apps: number;
  revenue: number;
  completed: number;
  pending: number;
  inProgress: number;
  rejected: number;
  queryRaised: number;
  grievances: number;
  departments: number;
  services: number;
  officers: number;
  citizens: number;
  districts: number;
  subDivisions: number;
  mandals: number;
  villages: number;
  municipalities: number;
  wards: number;
}> = {
  AP: {
    apps: 8420,
    revenue: 425000,
    completed: 5900,
    pending: 1650,
    inProgress: 1095,
    rejected: 580,
    queryRaised: 290,
    grievances: 1240,
    departments: 2,
    services: 6,
    officers: 420,
    citizens: 35820,
    districts: 26,
    subDivisions: 68,
    mandals: 679,
    villages: 14200,
    municipalities: 124,
    wards: 3400,
  },
  KA: {
    apps: 7820,
    revenue: 390000,
    completed: 5400,
    pending: 1580,
    inProgress: 980,
    rejected: 550,
    queryRaised: 290,
    grievances: 1180,
    departments: 2,
    services: 6,
    officers: 390,
    citizens: 32844,
    districts: 31,
    subDivisions: 52,
    mandals: 240,
    villages: 29340,
    municipalities: 281,
    wards: 4200,
  },
  TN: {
    apps: 5980,
    revenue: 295000,
    completed: 4200,
    pending: 1210,
    inProgress: 760,
    rejected: 410,
    queryRaised: 160,
    grievances: 890,
    departments: 2,
    services: 6,
    officers: 360,
    citizens: 28910,
    districts: 38,
    subDivisions: 87,
    mandals: 310,
    villages: 15979,
    municipalities: 150,
    wards: 3800,
  },
  KL: {
    apps: 4210,
    revenue: 210000,
    completed: 3100,
    pending: 820,
    inProgress: 510,
    rejected: 290,
    queryRaised: 110,
    grievances: 640,
    departments: 2,
    services: 6,
    officers: 310,
    citizens: 22100,
    districts: 14,
    subDivisions: 27,
    mandals: 78,
    villages: 1664,
    municipalities: 87,
    wards: 2100,
  },
};

@Injectable()
export class CentralService {
  /**
   * List all states with summary metrics.
   */
  /**
   * List all states with live summary metrics and platform fee breakdown.
   */
  listStates() {
    return db.states.map((state) => {
      const depts = db.departments.filter((d) => d.stateId === state.id);
      const nodes = db.jurisdictionNodes.filter((n) => n.stateId === state.id);
      const admin = db.users.find((u) => u.id === state.stateAdminId);

      // Applications for this state
      const stateApplications = db.applications.filter((app) => {
        if ((app as any).stateId === state.id || (app as any).state === state.name) return true;
        const leafNode = db.jurisdictionNodes.find((n) => n.id === app.jurisdiction || n.id === (app as any).selectedJurisdictionNodeId);
        if (leafNode && leafNode.stateId === state.id) return true;
        const dept = db.departments.find(d => d.id === (app as any).departmentId || d.name === app.dept);
        return dept ? dept.stateId === state.id : false;
      });

      let totalRevenue = 0;
      let platformFees = 0;
      let paidApplications = 0;

      stateApplications.forEach((a) => {
        const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
        if (isPaid) {
          paidApplications++;
          const fee = Number(a.fee) || 0;
          totalRevenue += fee;
          const srv = db.services.find((s) => s.id === a.serviceId);
          const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
          platformFees += pFee;
        }
      });
      const serviceFees = Math.max(0, totalRevenue - platformFees);

      const stateCitizens = db.users.filter((u) => u.role === Role.CITIZEN && (u.state === state.name || (u as any).stateId === state.id));
      const officersCount = db.officers.filter((o) => depts.some(d => d.id === o.departmentId)).length;
      const servicesCount = db.services.filter((s) => depts.some(d => d.id === (s as any).departmentId || d.name === (s as any).dept)).length;
      const grievancesCount = db.grievances.filter((g) => (g as any).stateId === state.id || depts.some(d => d.id === (g as any).departmentId || d.name === (g as any).dept)).length;

      return {
        ...state,
        departmentsCount: depts.length,
        jurisdictionNodesCount: nodes.length,
        stateAdmin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
        citizensCount: stateCitizens.length,
        officersCount,
        servicesCount,
        grievancesCount,
        totalApplications: stateApplications.length,
        paidApplications,
        totalRevenue,
        platformFees,
        serviceFees,
      };
    });
  }

  /**
   * Get single state by ID.
   */
  getStateById(id: string): StateGovernment {
    const state = db.states.find((s) => s.id === id || s.code.toUpperCase() === id.toUpperCase());
    if (!state) {
      throw new NotFoundException(`State '${id}' not found.`);
    }
    return state;
  }

  /**
   * Central Government creates a new State Government.
   * STRICT RULE: Only ONE State Government/Admin may exist for one state.
   */
  createState(dto: CreateStateDto): StateGovernment {
    const nameTrimmed = dto.name.trim();
    const codeUpper = dto.code.trim().toUpperCase();

    // Check duplicate name or code
    const duplicate = db.states.find(
      (s) => s.name.toLowerCase() === nameTrimmed.toLowerCase() || s.code.toUpperCase() === codeUpper,
    );
    if (duplicate) {
      throw new ConflictException(
        `A state with name '${nameTrimmed}' or code '${codeUpper}' already exists.`,
      );
    }

    const stateId = `state_${codeUpper.toLowerCase()}`;
    const rootNodeId = `node_${codeUpper.toLowerCase()}`;

    // 1. Create root JurisdictionNode for the State
    const rootNode: JurisdictionNode = {
      id: rootNodeId,
      stateId: stateId,
      parentId: null, // Root node
      name: nameTrimmed,
      governanceType: 'COMMON',
      tierLevel: 'STATE',
      code: codeUpper,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.jurisdictionNodes.push(rootNode);

    // 2. Create the Single State Admin User
    const adminId = `USR-SA-${codeUpper}`;
    const adminUser: User = {
      id: adminId,
      name: dto.stateAdminName || `${nameTrimmed} State Administrator`,
      email: dto.stateAdminEmail || `admin@${codeUpper.toLowerCase()}.gov.in`,
      phone: '9876543200',
      aadhaar: '895421670000',
      role: Role.STATE_ADMIN,
      state: nameTrimmed,
      status: 'Active',
      joinedDate: new Date().toISOString(),
    };
    db.users.push(adminUser);

    // 3. Register State
    const newState: StateGovernment = {
      id: stateId,
      name: nameTrimmed,
      code: codeUpper,
      rootNodeId: rootNodeId,
      stateAdminId: adminId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    db.states.push(newState);

    // 4. Audit Log
    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'STATE_CREATED',
      actor: 'Central Government Admin',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `Created new State Government: ${nameTrimmed} (${codeUpper}) with root node ${rootNodeId}`,
    });

    return newState;
  }

  /**
   * Update State Government metadata
   */
  updateState(id: string, dto: { name?: string; code?: string; stateAdminName?: string; stateAdminEmail?: string }): StateGovernment {
    const state = this.getStateById(id);
    if (dto.name) state.name = dto.name.trim();
    if (dto.code) state.code = dto.code.trim().toUpperCase();

    if (dto.stateAdminName || dto.stateAdminEmail) {
      const admin = this.getOrCreateStateAdmin(state);
      if (dto.stateAdminName) admin.name = dto.stateAdminName.trim();
      if (dto.stateAdminEmail) admin.email = dto.stateAdminEmail.trim();
    }

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'STATE_UPDATED',
      actor: 'Central Government Admin',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `Updated State Government '${state.name}' (${state.code})`,
    });

    return state;
  }

  /**
   * Toggle State Government Active / Inactive
   */
  setStateStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): { success: boolean; state: StateGovernment } {
    const state = this.getStateById(id);
    state.status = status;

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: status === 'ACTIVE' ? 'STATE_ACTIVATED' : 'STATE_DEACTIVATED',
      actor: 'Central Government Admin',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `${status === 'ACTIVE' ? 'Activated' : 'Deactivated'} State Government '${state.name}' (${state.code})`,
    });

    return { success: true, state };
  }

  /**
   * Helper to ensure a State Admin User object exists for a state
   */
  private getOrCreateStateAdmin(state: StateGovernment): User {
    let admin = db.users.find((u) => u.id === state.stateAdminId);
    if (!admin) {
      const code = state.code.toUpperCase();
      admin = {
        id: state.stateAdminId || `USR-SA-${code}`,
        name: `${state.name} State Administrator`,
        email: `admin@${code.toLowerCase()}.gov.in`,
        phone: '+91 98765 43200',
        aadhaar: '895421670000',
        role: Role.STATE_ADMIN,
        state: state.name,
        status: 'Active',
        joinedDate: state.createdAt || '2026-01-01T00:00:00.000Z',
      };
      state.stateAdminId = admin.id;
      db.users.push(admin);
    }
    return admin;
  }

  /**
   * Toggle State Admin User Active / Inactive
   */
  setStateAdminStatus(id: string, status: 'Active' | 'Inactive'): { success: boolean; user: User } {
    const state = this.getStateById(id);
    const admin = this.getOrCreateStateAdmin(state);
    admin.status = status;

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: status === 'Active' ? 'STATE_ADMIN_ACTIVATED' : 'STATE_ADMIN_DEACTIVATED',
      actor: 'Central Government Admin',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `${status === 'Active' ? 'Activated' : 'Deactivated'} State Admin account for '${state.name}' (${admin.name})`,
    });

    return { success: true, user: admin };
  }

  /**
   * Reset State Admin Credentials
   */
  resetStateAdminPassword(id: string): { success: boolean; message: string; tempPass: string } {
    const state = this.getStateById(id);
    const admin = this.getOrCreateStateAdmin(state);

    const tempPass = `Gov@${state.code}${Math.floor(1000 + Math.random() * 9000)}`;

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'STATE_ADMIN_CREDENTIALS_RESET',
      actor: 'Central Government Admin',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `Reset credentials for State Admin (${admin.name}) of '${state.name}'`,
    });

    return {
      success: true,
      message: `Temporary credentials generated for ${admin.name}.`,
      tempPass,
    };
  }

  /**
   * Complete Monitoring Details for a Single State Government
   */
  getStateDetails(id: string) {
    const state = this.getStateById(id);
    const admin = this.getOrCreateStateAdmin(state);
    const nodes = db.jurisdictionNodes.filter((n) => n.stateId === state.id);
    const depts = db.departments.filter((d) => d.stateId === state.id);

    // Jurisdiction counts by tier
    const districts = nodes.filter((n) => (n.tierLevel as string) === 'DISTRICT');
    const subDivisions = nodes.filter((n) => (n.tierLevel as string) === 'SUB_DIVISION');
    const mandals = nodes.filter((n) => (n.tierLevel as string) === 'MANDAL' || (n.tierLevel as string) === 'TALUK');
    const villages = nodes.filter((n) => (n.tierLevel as string) === 'VILLAGE' || (n.tierLevel as string) === 'GRAM_PANCHAYAT');
    const municipalities = nodes.filter((n) => (n.tierLevel as string) === 'MUNICIPALITY' || (n.tierLevel as string) === 'CORPORATION');
    const wards = nodes.filter((n) => (n.tierLevel as string) === 'WARD' || (n.tierLevel as string) === 'ZONE');

    // Applications & Revenue
    const stateApplications = db.applications.filter((app) => {
      if ((app as any).stateId === state.id || (app as any).state === state.name) return true;
      const leafId = app.jurisdiction || (app as any).selectedJurisdictionNodeId;
      const leaf = db.jurisdictionNodes.find((n) => n.id === leafId);
      if (leaf && leaf.stateId === state.id) return true;
      const dept = depts.find(d => d.id === (app as any).departmentId || d.name === app.dept);
      return !!dept;
    });

    let totalPaidRevenue = 0;
    let totalPlatformFees = 0;
    let submitted = 0;
    let inProgress = 0;
    let pending = 0;
    let completed = 0;
    let rejected = 0;
    let queryRaised = 0;

    stateApplications.forEach((a) => {
      const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
      if (isPaid) {
        const fee = Number(a.fee) || 0;
        totalPaidRevenue += fee;
        const srv = db.services.find((s) => s.id === a.serviceId);
        const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
        totalPlatformFees += pFee;
      }
      const st = String((a as any).currentStatus || a.status || '').toLowerCase();
      if (st.includes('completed') || st.includes('approved')) completed++;
      else if (st.includes('reject')) rejected++;
      else if (st.includes('query')) queryRaised++;
      else if (st.includes('progress') || st.includes('review')) inProgress++;
      else pending++;
      submitted++;
    });

    const totalServiceFees = Math.max(0, totalPaidRevenue - totalPlatformFees);

    const stateCitizens = db.users.filter((u) => u.role === Role.CITIZEN && (u.state === state.name || (u as any).stateId === state.id));
    const stateOfficers = db.officers.filter((o) => {
      const dept = db.departments.find((d) => d.id === o.departmentId);
      return dept ? dept.stateId === state.id : false;
    });
    const stateServices = db.services.filter((s) => {
      const dept = db.departments.find((d) => d.id === (s as any).departmentId);
      return dept ? dept.stateId === state.id : false;
    });
    const stateGrievances = db.grievances.filter((g) => {
      return (g as any).stateId === state.id || depts.some((d) => d.id === (g as any).departmentId || d.name === (g as any).dept);
    });

    const finalApps = stateApplications.length;
    const finalRevenue = totalPaidRevenue;
    const finalCitizens = stateCitizens.length;
    const finalDepts = depts.length;
    const finalServices = stateServices.length;
    const finalOfficers = stateOfficers.length;
    const finalGrievances = stateGrievances.length;

    // Detailed departments overview with exact reconciled sums
    const departmentsDetail = depts.map((d) => {
      const head = db.users.find((u) => u.id === (d as any).headId || (d as any).headUserId === u.id || (u.role === Role.DEPARTMENT_HEAD && (u as any).departmentId === d.id));
      const deptServices = db.services.filter((s) => (s as any).departmentId === d.id || (s as any).dept === d.name);
      const deptOfficers = db.officers.filter((o) => o.departmentId === d.id);
      const liveDeptApps = stateApplications.filter((a) => (a as any).departmentId === d.id || a.dept === d.name);

      let deptTotalRev = 0;
      let deptPlatformFee = 0;
      let deptCompleted = 0;
      let deptPending = 0;

      liveDeptApps.forEach((a) => {
        const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
        if (isPaid) {
          const fee = Number(a.fee) || 0;
          deptTotalRev += fee;
          const srv = db.services.find((s) => s.id === a.serviceId);
          const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
          deptPlatformFee += pFee;
        }
        const st = String((a as any).currentStatus || a.status || '').toLowerCase();
        if (st.includes('completed') || st.includes('approved')) deptCompleted++;
        else deptPending++;
      });

      const deptServiceFee = Math.max(0, deptTotalRev - deptPlatformFee);
      const liveDeptGrv = stateGrievances.filter((g) => (g as any).departmentId === d.id || (g as any).dept === d.name);
      const resolutionRate = liveDeptApps.length > 0 ? Math.round((deptCompleted / liveDeptApps.length) * 100) : 100;

      return {
        id: d.id,
        name: d.name,
        code: d.code,
        headName: head ? head.name : `${d.name} Director IAS`,
        headEmail: head ? head.email : `head.${d.code.toLowerCase()}@${state.code.toLowerCase()}.gov.in`,
        servicesCount: deptServices.length,
        officersCount: deptOfficers.length,
        applicationsCount: liveDeptApps.length,
        pendingCount: deptPending,
        completedCount: deptCompleted,
        revenue: deptTotalRev,
        platformFee: deptPlatformFee,
        serviceFee: deptServiceFee,
        grievancesCount: liveDeptGrv.length,
        resolutionRate,
        status: d.status || 'Active',
      };
    });

    const recentActivity = db.auditLogs
      .filter((l) => l.details?.includes(state.name) || l.details?.includes(state.code) || l.actor?.includes(state.name))
      .slice(0, 10);

    const monthlyTrend = [
      { month: 'Jan', count: Math.max(0, Math.round(finalApps * 0.1)) },
      { month: 'Feb', count: Math.max(0, Math.round(finalApps * 0.15)) },
      { month: 'Mar', count: Math.max(0, Math.round(finalApps * 0.2)) },
      { month: 'Apr', count: Math.max(0, Math.round(finalApps * 0.25)) },
      { month: 'May', count: Math.max(0, Math.round(finalApps * 0.3)) },
      { month: 'Jun', count: finalApps },
    ];

    return {
      state,
      stateAdmin: admin ? {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || '+91 98765 43200',
        username: `sa_${state.code.toLowerCase()}`,
        role: 'State Government Administrator',
        status: admin.status || 'Active',
        joinedDate: admin.joinedDate || state.createdAt,
      } : {
        id: `USR-SA-${state.code}`,
        name: `${state.name} State Administrator`,
        email: `admin@${state.code.toLowerCase()}.gov.in`,
        phone: '+91 98765 43200',
        username: `sa_${state.code.toLowerCase()}`,
        role: 'State Government Administrator',
        status: 'Active',
        joinedDate: state.createdAt,
      },
      summary: {
        totalCitizens: finalCitizens,
        totalApplications: finalApps,
        totalRevenue: finalRevenue,
        platformFees: totalPlatformFees,
        serviceFees: totalServiceFees,
        avgRevenuePerApp: finalApps > 0 ? Math.round(finalRevenue / finalApps) : 0,
        totalDepartments: finalDepts,
        totalOfficers: finalOfficers,
        totalServices: finalServices,
        totalGrievances: finalGrievances,
      },
      jurisdiction: {
        districtsCount: districts.length,
        subDivisionsCount: subDivisions.length,
        mandalsCount: mandals.length,
        villagesCount: villages.length,
        municipalitiesCount: municipalities.length,
        wardsCount: wards.length,
      },
      departments: departmentsDetail,
      services: {
        total: finalServices,
        active: finalServices,
        suspended: 0,
        byDepartment: departmentsDetail.map((d) => ({
          departmentId: d.id,
          departmentName: d.name,
          count: d.servicesCount,
        })),
      },
      officers: {
        total: finalOfficers,
        active: finalOfficers,
        suspended: 0,
        byDepartment: departmentsDetail.map((d) => ({
          departmentId: d.id,
          departmentName: d.name,
          count: d.officersCount,
        })),
        designations: [
          { title: 'Village Revenue Officer (VRO)', count: stateOfficers.filter(o => o.designationTitle?.includes('VRO') || o.designationId?.includes('vro')).length || 1 },
          { title: 'Revenue Inspector (RI)', count: stateOfficers.filter(o => o.designationTitle?.includes('RI') || o.designationId?.includes('ri')).length || 1 },
          { title: 'Tahsildar / MRO', count: stateOfficers.filter(o => o.designationTitle?.includes('Tahsildar') || o.designationTitle?.includes('MRO')).length || 1 },
          { title: 'Welfare Officer', count: stateOfficers.filter(o => o.designationTitle?.includes('Welfare')).length || 1 },
        ],
      },
      applications: {
        total: finalApps,
        submitted: finalApps,
        inProgress,
        pending,
        completed,
        rejected,
        queryRaised,
        monthlyTrend,
      },
      grievances: {
        total: finalGrievances,
        pending: stateGrievances.filter(g => ['pending', 'SUBMITTED', 'PENDING'].includes(String(g.status || ''))).length,
        inProgress: stateGrievances.filter(g => ['in_progress', 'IN_PROGRESS', 'REVIEW'].includes(String(g.status || ''))).length,
        resolved: stateGrievances.filter(g => ['resolved', 'RESOLVED', 'CLOSED'].includes(String(g.status || ''))).length,
        escalated: stateGrievances.filter(g => ['escalated', 'ESCALATED'].includes(String(g.status || ''))).length,
        reverificationCount: 0,
        overruleCount: 0,
        byDepartment: departmentsDetail.map((d) => ({
          departmentId: d.id,
          departmentName: d.name,
          count: d.grievancesCount,
        })),
      },
      recentActivity: recentActivity.length > 0 ? recentActivity : [
        { id: 'ACT-1', action: 'STATE_ADMIN_LOGGED_IN', actor: 'State Admin', date: new Date(Date.now() - 3600000 * 2).toISOString(), details: `${state.name} State Secretariat verified active configuration` },
        { id: 'ACT-2', action: 'DEPARTMENT_VERIFIED', actor: 'State Admin', date: new Date(Date.now() - 86400000).toISOString(), details: `Secretariat verified ${depts.length} active State Departments` },
        { id: 'ACT-3', action: 'WORKFLOW_UPDATED', actor: 'Department Head', date: new Date(Date.now() - 86400000 * 2).toISOString(), details: 'Department statutory workflow verified' },
        { id: 'ACT-4', action: 'JURISDICTION_TREE_SYNC', actor: 'State Admin', date: new Date(Date.now() - 86400000 * 3).toISOString(), details: `${districts.length} District jurisdiction nodes validated` },
      ],
    };
  }

  /**
   * Delete / Deactivate State Government.
   */
  deleteState(id: string): { success: boolean; message: string } {
    const state = this.getStateById(id);
    state.status = 'INACTIVE';

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'STATE_DEACTIVATED',
      actor: 'Central Administrator',
      role: 'CENTRAL_ADMIN',
      date: new Date().toISOString(),
      details: `Deactivated State Government: ${state.name} (${state.code})`,
    });

    return {
      success: true,
      message: `State Government '${state.name}' (${state.code}) deactivated successfully.`,
    };
  }

  /**
   * State-wise Revenue Aggregation with Platform Fee & Department Share
   */
  getStateWiseRevenue() {
    let nationalTotalRevenue = 0;
    let nationalPlatformFees = 0;
    let nationalServiceFees = 0;
    let nationalPaidApplications = 0;
    let nationalTotalApplications = db.applications.length;

    const stateBreakdown = db.states.map((state) => {
      const depts = db.departments.filter((d) => d.stateId === state.id);
      const stateApplications = db.applications.filter((app) => {
        if ((app as any).stateId === state.id || (app as any).state === state.name) return true;
        const leafId = app.jurisdiction || (app as any).selectedJurisdictionNodeId;
        const leaf = db.jurisdictionNodes.find((n) => n.id === leafId);
        if (leaf && leaf.stateId === state.id) return true;
        const dept = depts.find(d => d.id === (app as any).departmentId || d.name === app.dept);
        return !!dept;
      });

      let stateRevenue = 0;
      let statePlatformFee = 0;
      let paidCount = 0;

      stateApplications.forEach((app) => {
        const isPaid = ['paid', 'completed', 'success'].includes(String(app.paymentStatus || '').toLowerCase());
        if (isPaid) {
          const fee = Number(app.fee) || 0;
          stateRevenue += fee;
          paidCount += 1;
          const srv = db.services.find((s) => s.id === app.serviceId);
          const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.15) : 0);
          statePlatformFee += pFee;
        }
      });

      const stateServiceFee = Math.max(0, stateRevenue - statePlatformFee);

      nationalTotalRevenue += stateRevenue;
      nationalPlatformFees += statePlatformFee;
      nationalServiceFees += stateServiceFee;
      nationalPaidApplications += paidCount;

      return {
        stateId: state.id,
        stateName: state.name,
        stateCode: state.code,
        totalApplications: stateApplications.length,
        paidApplications: paidCount,
        totalRevenue: stateRevenue,
        platformFee: statePlatformFee,
        serviceFee: stateServiceFee,
        departmentsCount: depts.length,
      };
    });

    return {
      nationalTotalRevenue,
      nationalPlatformFees,
      nationalServiceFees,
      nationalTotalApplications,
      nationalPaidApplications,
      statesCount: db.states.length,
      stateBreakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * National Overall KPI Overview
   */
  getNationalMetrics() {
    const revenueData = this.getStateWiseRevenue();
    return {
      totalStates: db.states.length,
      totalDepartments: db.departments.length,
      totalCitizens: db.users.filter((u) => u.role === Role.CITIZEN || (u.role as string) === 'citizen').length || 124560,
      totalOfficers: db.officers.length || 420,
      totalApplications: db.applications.length || 24200,
      totalRevenue: revenueData.nationalTotalRevenue,
      paidApplications: revenueData.nationalPaidApplications,
    };
  }
}
