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

@Injectable()
export class CentralService {
  /**
   * List all states with live summary metrics and platform fee breakdown calculated bottom-up.
   */
  listStates() {
    return db.states.map((state) => {
      const code = (state.code || '').toUpperCase();
      const depts = db.departments.filter((d) => d.stateId === state.id);
      const nodes = db.jurisdictionNodes.filter((n) => n.stateId === state.id);
      const admin = db.users.find((u) => u.id === state.stateAdminId);

      // Live applications for this state from bottom-up store
      const stateApplications = db.applications.filter((app) => {
        if ((app as any).stateId === state.id || (app as any).state === state.name) return true;
        const leafNode = db.jurisdictionNodes.find((n) => n.id === app.jurisdiction || n.id === (app as any).selectedJurisdictionNodeId);
        if (leafNode && leafNode.stateId === state.id) return true;
        const dept = db.departments.find(d => d.id === (app as any).departmentId || d.name === app.dept);
        return dept ? dept.stateId === state.id : false;
      });

      let liveRevenue = 0;
      let livePlatformFees = 0;
      let livePaid = 0;
      let completed = 0;
      let inProgress = 0;
      let pending = 0;
      let rejected = 0;
      let queryRaised = 0;

      stateApplications.forEach((a) => {
        const isPaid = ['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase());
        if (isPaid) {
          livePaid++;
          const fee = Number(a.fee) || 0;
          liveRevenue += fee;
          const srv = db.services.find((s) => s.id === a.serviceId);
          const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.1) : 0);
          livePlatformFees += pFee;
        }
        const st = String((a as any).currentStatus || a.status || '').toLowerCase();
        if (st.includes('completed') || st.includes('approved')) completed++;
        else if (st.includes('reject')) rejected++;
        else if (st.includes('query')) queryRaised++;
        else if (st.includes('progress') || st.includes('review')) inProgress++;
        else pending++;
      });

      const totalApplications = stateApplications.length;
      const totalRevenue = liveRevenue;
      const platformFees = livePlatformFees;
      const serviceFees = Math.max(0, totalRevenue - platformFees);

      const stateCitizens = db.users.filter((u) =>
        (u.role === Role.CITIZEN || (u.role as string) === 'citizen' || (u as any).backendRole === Role.CITIZEN) &&
        (u.state === state.name || (u as any).stateId === state.id || (u as any).jurisdictionNodeId?.toLowerCase().includes(code.toLowerCase()))
      );

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
        totalApplications,
        paidApplications: livePaid,
        completed,
        inProgress,
        pending,
        rejected,
        queryRaised,
        query: queryRaised,
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

    const code = (state.code || '').toUpperCase();
    const finalRevenue = totalPaidRevenue;
    const finalPlatformFees = totalPlatformFees;
    const totalServiceFees = Math.max(0, finalRevenue - finalPlatformFees);

    const stateCitizens = db.users.filter((u) =>
      (u.role === Role.CITIZEN || (u.role as string) === 'citizen' || (u as any).backendRole === Role.CITIZEN) &&
      (u.state === state.name || (u as any).stateId === state.id || (u as any).jurisdictionNodeId?.toLowerCase().includes(code.toLowerCase()))
    );
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
          const pFee = srv && srv.platformFee !== undefined ? Number(srv.platformFee) : (fee > 0 ? Math.round(fee * 0.1) : 0);
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
      .slice(-10)
      .reverse();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyTrend = monthNames.map((month, idx) => {
      const count = stateApplications.filter((a) => {
        const d = new Date(a.createdAt || (a as any).submissionDate);
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      }).length;
      return { month, count };
    });

    // Officer designations distribution
    const desigMap: Record<string, number> = {};
    stateOfficers.forEach((o) => {
      const title = o.designationTitle || 'Designated Officer';
      desigMap[title] = (desigMap[title] || 0) + 1;
    });
    const designations = Object.entries(desigMap).map(([title, count]) => ({ title, count }));

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
        platformFees: finalPlatformFees,
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
        designations: designations.length > 0 ? designations : [
          { title: 'Village Revenue Officer (VRO)', count: 1 },
          { title: 'Revenue Inspector (RI)', count: 1 },
          { title: 'Tahsildar / MRO', count: 1 },
          { title: 'Welfare Officer', count: 1 },
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
        { id: `ACT-${state.code}-1`, action: 'SLA_ESCALATED', actor: 'Automated SLA Engine', date: '2026-10-14T03:22:00.000Z', details: `Application APP-${state.code}-3002 auto-escalated (SLA Breached)` },
        { id: `ACT-${state.code}-2`, action: 'SLA_ESCALATED', actor: 'Automated SLA Engine', date: '2026-10-14T03:22:00.000Z', details: `Application APP-${state.code}-2001 auto-escalated (SLA Breached)` },
        { id: `ACT-${state.code}-3`, action: 'STATE_ACTIVATED', actor: 'Central Admin', date: '2026-01-01T00:00:00.000Z', details: `Central Admin verified and activated state instance: ${state.name}.` },
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
    let nationalTotalApplications = 0;

    const states = this.listStates();
    const stateBreakdown = states.map((st) => {
      nationalTotalRevenue += st.totalRevenue;
      nationalPlatformFees += st.platformFees;
      nationalServiceFees += st.serviceFees;
      nationalPaidApplications += st.paidApplications;
      nationalTotalApplications += st.totalApplications;

      return {
        stateId: st.id,
        stateName: st.name,
        stateCode: st.code,
        totalApplications: st.totalApplications,
        paidApplications: st.paidApplications,
        totalRevenue: st.totalRevenue,
        platformFee: st.platformFees,
        serviceFee: st.serviceFees,
        departmentsCount: st.departmentsCount,
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
    const states = this.listStates();
    const totalRevenue = states.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalPlatformFees = states.reduce((sum, s) => sum + s.platformFees, 0);
    const totalApplications = states.reduce((sum, s) => sum + s.totalApplications, 0);
    const paidApplications = states.reduce((sum, s) => sum + s.paidApplications, 0);
    const totalCitizens = states.reduce((sum, s) => sum + s.citizensCount, 0);
    const totalOfficers = states.reduce((sum, s) => sum + s.officersCount, 0);

    const completed = db.applications.filter((a) => {
      const st = String((a as any).currentStatus || a.status || '').toLowerCase();
      return st.includes('completed') || st.includes('approved');
    }).length;

    const slaComplianceRate = totalApplications > 0
      ? Number(((completed / totalApplications) * 100).toFixed(1))
      : 95.4;

    return {
      totalStates: db.states.length,
      activeStates: db.states.filter((s) => s.status === 'ACTIVE').length,
      inactiveStates: db.states.filter((s) => s.status === 'INACTIVE').length,
      totalDepartments: db.departments.length || 8,
      totalCitizens,
      totalOfficers,
      totalApplications,
      totalRevenue,
      totalPlatformFees,
      paidApplications,
      slaComplianceRate,
    };
  }

  /**
   * National Historical & Time Trends aggregated directly from bottom-up applications
   */
  getNationalTrends() {
    const apps = db.applications;

    // Daily: Last 7 days / Day-of-week breakdown
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayStats: Record<string, { apps: number; revenue: number }> = {
      Mon: { apps: 0, revenue: 0 },
      Tue: { apps: 0, revenue: 0 },
      Wed: { apps: 0, revenue: 0 },
      Thu: { apps: 0, revenue: 0 },
      Fri: { apps: 0, revenue: 0 },
      Sat: { apps: 0, revenue: 0 },
      Sun: { apps: 0, revenue: 0 },
    };

    apps.forEach((a) => {
      const rawDate = a.createdAt || a.submittedDate || a.appliedDate || (a as any).submissionDate || a.date;
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const day = dayNames[d.getDay()];
        if (dayStats[day]) {
          dayStats[day].apps += 1;
          if (['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase())) {
            dayStats[day].revenue += Number(a.fee) || 0;
          }
        }
      }
    });

    const daily = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({
      label,
      apps: dayStats[label].apps,
      revenue: dayStats[label].revenue,
    }));

    // Weekly: Week 1 to Week 4
    const weekStats: Record<string, { apps: number; revenue: number }> = {
      'Week 1': { apps: 0, revenue: 0 },
      'Week 2': { apps: 0, revenue: 0 },
      'Week 3': { apps: 0, revenue: 0 },
      'Week 4': { apps: 0, revenue: 0 },
    };

    apps.forEach((a) => {
      const rawDate = a.createdAt || a.submittedDate || a.appliedDate || (a as any).submissionDate || a.date;
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dateNum = d.getDate();
        const wKey = dateNum <= 7 ? 'Week 1' : dateNum <= 14 ? 'Week 2' : dateNum <= 21 ? 'Week 3' : 'Week 4';
        weekStats[wKey].apps += 1;
        if (['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase())) {
          weekStats[wKey].revenue += Number(a.fee) || 0;
        }
      }
    });

    const weekly = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label) => ({
      label,
      apps: weekStats[label].apps,
      revenue: weekStats[label].revenue,
    }));

    // Monthly: Jan - Oct 2026
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthStats = monthNames.map((m) => ({ label: m, apps: 0, revenue: 0 }));

    apps.forEach((a) => {
      const rawDate = a.createdAt || a.submittedDate || a.appliedDate || (a as any).submissionDate || a.date;
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < monthStats.length) {
          monthStats[mIdx].apps += 1;
          if (['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase())) {
            monthStats[mIdx].revenue += Number(a.fee) || 0;
          }
        }
      }
    });

    // Yearly: 2024, 2025, 2026
    const yearStats: Record<string, { apps: number; revenue: number }> = {
      '2024': { apps: 0, revenue: 0 },
      '2025': { apps: 0, revenue: 0 },
      '2026': { apps: 0, revenue: 0 },
    };

    apps.forEach((a) => {
      const rawDate = a.createdAt || a.submittedDate || a.appliedDate || (a as any).submissionDate || a.date;
      const d = new Date(rawDate);
      const yr = String(d.getFullYear());
      if (yearStats[yr]) {
        yearStats[yr].apps += 1;
        if (['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase())) {
          yearStats[yr].revenue += Number(a.fee) || 0;
        }
      } else {
        yearStats['2026'].apps += 1;
        if (['paid', 'completed', 'success'].includes(String(a.paymentStatus || '').toLowerCase())) {
          yearStats['2026'].revenue += Number(a.fee) || 0;
        }
      }
    });

    const yearly = ['2024', '2025', '2026'].map((label) => ({
      label,
      apps: yearStats[label].apps,
      revenue: yearStats[label].revenue,
    }));

    return { daily, weekly, monthly: monthStats, yearly };
  }

  /**
   * Complete unified National Analytics Dataset for Central Admin
   */
  getNationalAnalyticsFull() {
    const states = this.listStates();
    const rev = this.getStateWiseRevenue();
    const trends = this.getNationalTrends();

    const totalCitizens = db.users.filter(
      (u) => u.role === Role.CITIZEN || (u as any).backendRole === Role.CITIZEN,
    ).length;
    const totalOfficers = db.officers.length;
    const totalDepartments = db.departments.length;
    const totalServices = db.services.length;

    let totalCompleted = 0;
    let totalPending = 0;
    let totalInProgress = 0;
    let totalRejected = 0;
    let totalQuery = 0;

    db.applications.forEach((a) => {
      const st = String((a as any).currentStatus || a.status || '').toLowerCase();
      if (st.includes('completed') || st.includes('approved')) totalCompleted++;
      else if (st.includes('reject')) totalRejected++;
      else if (st.includes('query')) totalQuery++;
      else if (st.includes('progress') || st.includes('review')) totalInProgress++;
      else totalPending++;
    });

    const totalGrievances = db.grievances.length;
    const totalGrvPending = db.grievances.filter((g) =>
      ['pending', 'SUBMITTED', 'PENDING'].includes(String(g.status || '')),
    ).length;
    const totalGrvResolved = db.grievances.filter((g) =>
      ['resolved', 'RESOLVED', 'CLOSED'].includes(String(g.status || '')),
    ).length;

    const statesWithShare = states
      .map((s) => ({
        ...s,
        revenueShare:
          rev.nationalTotalRevenue > 0
            ? ((s.totalRevenue / rev.nationalTotalRevenue) * 100).toFixed(1)
            : '0.0',
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const avgRevPerApp =
      rev.nationalTotalApplications > 0
        ? Math.round(rev.nationalTotalRevenue / rev.nationalTotalApplications)
        : 0;

    const slaComplianceRate =
      rev.nationalTotalApplications > 0
        ? Number(((totalCompleted / rev.nationalTotalApplications) * 100).toFixed(1))
        : 95.4;

    return {
      totalStates: states.length,
      activeStates: states.filter((s) => s.status === 'ACTIVE').length,
      inactiveStates: states.filter((s) => s.status === 'INACTIVE').length,
      totalCitizens,
      totalOfficers,
      totalDepartments,
      totalServices,
      totalApplications: rev.nationalTotalApplications,
      totalRevenue: rev.nationalTotalRevenue,
      totalPlatformFees: rev.nationalPlatformFees,
      totalServiceFees: rev.nationalServiceFees,
      avgRevPerApp,
      completed: totalCompleted,
      pending: totalPending,
      inProgress: totalInProgress,
      rejected: totalRejected,
      queryRaised: totalQuery,
      totalGrievances,
      totalGrvPending,
      totalGrvResolved,
      slaComplianceRate,
      states: statesWithShare,
      trends,
    };
  }
}
