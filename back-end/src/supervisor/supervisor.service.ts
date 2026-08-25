import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { User } from '../models/user.model';
import { AppStatus, GrievanceStatus } from '../models/enums';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupervisorService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  getDashboardStats(userId?: string) {
    let apps = db.applications;
    let grievances = db.grievances;
    let supervisor: User | null = null;

    if (userId) {
      try {
        supervisor = this.usersService.findById(userId);
      } catch (e) {}
      if (supervisor && supervisor.role === 'supervisor') {
        const sup = supervisor; // narrow null for TS
        apps = apps.filter(a => a.dept === sup.dept && (sup.jurisdiction === 'All' || a.jurisdiction === sup.jurisdiction));
        // Note: Grievance objects in mock data don't currently have a direct 'jurisdiction' property, but they should be filtered based on the related application's jurisdiction.
        const appIdsInJurisdiction = new Set(apps.map(a => a.id));
        grievances = grievances.filter(g => g.relatedAppId && appIdsInJurisdiction.has(g.relatedAppId));
      }
    }

    // Build live team: active officers in the same dept, within supervisor jurisdiction
    const teamOfficers = db.users.filter(u => {
      if (u.role !== 'officer' || u.status === 'Suspended') return false;
      if (supervisor) {
        const sameDept = u.dept === supervisor.dept;
        const inJurisdiction = supervisor.jurisdiction === 'All' || u.jurisdiction === supervisor.jurisdiction || u.jurisdiction === 'All';
        return sameDept && inJurisdiction;
      }
      return true;
    });

    const team = teamOfficers.map(o => {
      const activeStatuses = ['pending', 'under-review', 'query', 'pending_external_verification'];
      const pending = db.applications.filter(a => a.officerId === o.id && activeStatuses.includes(a.status)).length;
      const breached = db.applications.filter(a => a.officerId === o.id && a.slaDate && new Date(a.slaDate) < new Date() && activeStatuses.includes(a.status)).length;
      const approved = db.applications.filter(a => a.officerId === o.id && (a.status === 'approved' || a.status === 'completed')).length;
      const initials = o.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
      return {
        name: o.name,
        role: o.title || 'Officer',
        initials,
        pending,
        breach: breached,
        approved,
        sla: o.sla || 90,
        dept: o.dept,
        jurisdiction: o.jurisdiction,
      };
    });

    const now = new Date();
    const activeStatuses = ['pending', 'under-review', 'query', 'pending_external_verification', 'escalated'];

    const pendingApprovals = apps
      .filter(a => a.status === 'approved')
      .map(a => {
        const slaLeft = a.slaDate ? Math.ceil((new Date(a.slaDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) : 0;
        return {
          id: a.id,
          service: a.serviceName,
          citizen: a.citizenName,
          officer: a.officerName,
          role: 'Officer',
          submitted: a.submittedDate ? new Date(a.submittedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-',
          slaLeft,
          docs: a.documents || [],
          documents: a.documents || [],
          officerNote: a.remarks || 'No remarks provided.',
          timeline: a.timeline?.map(t => ({
            d: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            e: t.action,
            t: 'info'
          })) || []
        };
      });

    const slaBreaches = apps
      .filter(a => activeStatuses.includes(a.status) && a.slaDate && new Date(a.slaDate) < now)
      .map(a => {
        const overdue = Math.ceil((now.getTime() - new Date(a.slaDate).getTime()) / (1000 * 3600 * 24));
        return {
          id: a.id,
          service: a.serviceName,
          citizen: a.citizenName,
          officer: a.officerName,
          officerId: a.officerId,
          overdue: `${overdue} days`,
          on: new Date(a.slaDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        };
      });

    const escalatedSlaCases = apps
      .filter(a => activeStatuses.includes(a.status) && a.slaDate && new Date(a.slaDate) < now)
      .filter(a => !grievances.some(g => g.relatedAppId === a.id && g.status === 'escalated'))
      .map(a => {
        const overdue = Math.ceil((now.getTime() - new Date(a.slaDate).getTime()) / (1000 * 3600 * 24));
        return {
          id: a.id,
          type: 'sla',
          service: a.serviceName,
          citizen: a.citizenName,
          officer: a.officerName,
          officerId: a.officerId,
          overdue,
          on: new Date(a.slaDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          urgent: overdue > 5,
          officerDecision: 'No decision — SLA exceeded',
          docs: a.documents || [],
          documents: a.documents || [],
          summary: `Application SLA exceeded by ${overdue} days.`,
          timeline: a.timeline?.map(t => ({
            d: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            e: t.action,
            t: t.action.includes('Breach') || t.action.includes('Escalate') ? 'danger' : 'info'
          })) || []
        };
      });

    const grievanceEscalations = grievances
      .filter(g => g.status === 'escalated')
      .map(g => {
        const app = db.applications.find(a => a.id === g.relatedAppId);
        return {
          id: app?.id || g.relatedAppId,
          service: app?.serviceName || 'Unknown',
          citizen: g.citizenName,
          officer: app?.officerName || 'Unknown',
          subtype: g.category === 'misconduct' ? 'Misconduct Complaint' : 'Rejection Dispute',
          badge: g.category === 'misconduct' ? 'badge-danger' : 'badge-warning',
          go: g.officerName,
          on: new Date(g.filedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          summary: g.description,
          officerDecision: 'Escalated to Supervisor',
          urgent: g.priority === 'high'
        };
      });

    const escalatedGrievanceCases = grievances
      .filter(g => g.status === 'escalated')
      .map(g => {
        const app = db.applications.find(a => a.id === g.relatedAppId);
        return {
          id: app?.id || g.relatedAppId,
          grievanceId: g.id,
          type: 'grievance',
          subtype: g.category === 'misconduct' ? 'Misconduct Complaint' : 'Rejection Dispute',
          service: app?.serviceName || 'Unknown',
          citizen: g.citizenName,
          officer: app?.officerName || 'Unknown',
          officerId: app?.officerId,
          on: new Date(g.filedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          urgent: g.priority === 'high',
          officerDecision: 'Escalated to Supervisor',
          docs: app?.documents || [],
          documents: app?.documents || [],
          evidence: g.evidence || [],
          go: g.officerName,
          summary: g.description,
          timeline: g.history?.map(t => ({
            d: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            e: t.action,
            t: t.action.includes('Escalate') ? 'danger' : (t.action.includes('Investigat') ? 'warn' : 'info')
          })) || []
        };
      });

    const pendingApps = apps
      .filter(a => a.status === 'pending' || a.status === 'under-review')
      .map(a => {
        const slaLeft = a.slaDate ? Math.ceil((new Date(a.slaDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) : 0;
        return {
          id: a.id,
          service: a.serviceName,
          citizen: a.citizenName,
          officer: a.officerName,
          slaLeft
        };
      });

    return {
      totalApplications: apps.length,
      pendingReview: apps.filter(a => a.status === AppStatus.UNDER_REVIEW || a.status === AppStatus.PENDING).length,
      escalatedCases: apps.filter(a => a.status === AppStatus.ESCALATED).length,
      activeGrievances: grievances.filter(g => g.status === GrievanceStatus.OPEN || g.status === GrievanceStatus.INVESTIGATING).length,
      pendingApprovals,
      approvedToday: apps.filter(a => a.status === 'approved' || a.status === 'completed').length,
      slaBreaches,
      grievanceEscalations,
      team,
      escalatedSla: escalatedSlaCases,
      escalatedGrievance: escalatedGrievanceCases,
      pendingApps,
    };
  }

  getEscalated(userId?: string) {
    let apps = db.applications.filter(a => a.status === AppStatus.ESCALATED);
    let grievances = db.grievances.filter(g => g.status === GrievanceStatus.ESCALATED);

    if (userId) {
      let supervisor: User | null = null;
      try {
        supervisor = this.usersService.findById(userId);
      } catch(e) {}
      if (supervisor && supervisor.role === 'supervisor') {
        apps = apps.filter(a => a.dept === supervisor.dept && (supervisor.jurisdiction === 'All' || a.jurisdiction === supervisor.jurisdiction));
        const appIdsInJurisdiction = new Set(db.applications.filter(a => a.dept === supervisor!.dept && (supervisor!.jurisdiction === 'All' || a.jurisdiction === supervisor!.jurisdiction)).map(a => a.id));
        grievances = grievances.filter(g => g.relatedAppId && appIdsInJurisdiction.has(g.relatedAppId));
      }
    }

    return {
      applications: apps,
      grievances: grievances
    };
  }

  getWorkload() {
    return this.usersService.findAllOfficers()
      .map(officer => {
        const handledApps = db.applications.filter(a => a.officerId === officer.id);
        return {
          officerId: officer.id,
          name: officer.name,
          dept: officer.dept,
          activeTasks: handledApps.filter(a => a.status !== AppStatus.COMPLETED && a.status !== AppStatus.REJECTED).length,
          completedTasks: handledApps.filter(a => a.status === AppStatus.COMPLETED).length
        };
      });
  }

  assignApplication(appId: string, officerId: string) {
    const appIndex = db.applications.findIndex(a => a.id === appId);
    
    let officer: User | null = null;
    try {
      officer = this.usersService.findById(officerId);
    } catch(e) {}

    if (appIndex === -1) throw new NotFoundException('Application not found');
    if (!officer) throw new NotFoundException('Officer not found');

    db.applications[appIndex].officerId = officer.id;
    db.applications[appIndex].officerName = officer.name;
    
    db.applications[appIndex].timeline.push({
      action: 'Reassigned',
      date: new Date().toISOString(),
      actor: 'Supervisor',
      note: `Assigned to ${officer.name}`
    });

    return db.applications[appIndex];
  }

  reviewEscalated(appId: string, action: 'approve' | 'reject', remarks: string) {
    const appIndex = db.applications.findIndex(a => a.id === appId);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const status = action === 'approve' ? AppStatus.COMPLETED : AppStatus.REJECTED;
    db.applications[appIndex].status = status;
    db.applications[appIndex].remarks = remarks;

    db.applications[appIndex].timeline.push({
      action: `Supervisor Review: ${action}`,
      date: new Date().toISOString(),
      actor: 'Supervisor',
      note: remarks || ''
    });

    return db.applications[appIndex];
  }

  requestSuspension(officerId: string, supervisorId: string, grievanceId: string, reason: string) {
    // Find the officer
    let officer: User | null = null;
    try { officer = this.usersService.findById(officerId); } catch(e) {}
    if (!officer) throw new NotFoundException('Officer not found');

    // Find super user(s) to notify
    const superUsers = db.users.filter((u: any) => u.role === 'super_user' || u.role === 'super_admin');
    if (!superUsers.length) throw new NotFoundException('No Super User found in system');

    // Create a suspension_request notification for each super user
    superUsers.forEach((su: any) => {
      db.notifications.unshift({
        id: `NOT-${Math.floor(Math.random() * 90000 + 10000)}`,
        userId: su.id,
        title: '🚨 Suspension Request — Misconduct',
        message: `Supervisor requests suspension of Officer ${officer!.name} (${officer!.id}) due to misconduct. Grievance: ${grievanceId}. Reason: ${reason}`,
        type: 'danger',
        read: false,
        date: new Date().toISOString(),
        link: `Super User/officer-onboarding.html?highlight=${officer!.id}`,
        meta: { type: 'suspension_request', officerId: officer!.id, grievanceId }
      } as any);
    });

    // Audit log
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
      action: 'Suspension Request Raised',
      actor: supervisorId,
      role: 'supervisor',
      date: new Date().toISOString(),
      details: `Supervisor requested suspension of officer ${officer.name} (${officer.id}) for misconduct. Grievance: ${grievanceId}.`
    });

    return { success: true, message: `Suspension request sent to Super User for officer ${officer.name}.` };
  }
}
