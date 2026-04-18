import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { AppStatus, GrievanceStatus } from '../models/enums';

@Injectable()
export class SupervisorService {
  getDashboardStats() {
    const apps = db.applications;
    const grievances = db.grievances;

    return {
      totalApplications: apps.length,
      pendingReview: apps.filter(a => a.status === AppStatus.UNDER_REVIEW || a.status === AppStatus.PENDING).length,
      escalatedCases: apps.filter(a => a.status === AppStatus.ESCALATED).length,
      activeGrievances: grievances.filter(g => g.status === GrievanceStatus.OPEN || g.status === GrievanceStatus.INVESTIGATING).length,
    };
  }

  getEscalated() {
    return {
      applications: db.applications.filter(a => a.status === AppStatus.ESCALATED),
      grievances: db.grievances.filter(g => g.status === GrievanceStatus.ESCALATED)
    };
  }

  getWorkload() {
    return db.users
      .filter(u => u.role === 'officer')
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
    const officer = db.users.find(u => u.id === officerId);

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

    const status = action === 'approve' ? AppStatus.APPROVED : AppStatus.REJECTED;
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
}
