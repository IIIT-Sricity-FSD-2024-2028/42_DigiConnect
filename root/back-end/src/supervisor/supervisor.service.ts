import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { User } from '../models/user.model';
import { AppStatus, GrievanceStatus } from '../models/enums';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupervisorService {
  constructor(private readonly usersService: UsersService) {}

  getDashboardStats(userId?: string) {
    let apps = db.applications;
    let grievances = db.grievances;

    if (userId) {
      let supervisor: User | null = null;
      try {
        supervisor = this.usersService.findById(userId);
      } catch (e) {
        // User not found
      }
      if (supervisor && supervisor.role === 'supervisor') {
        apps = apps.filter(a => a.dept === supervisor.dept && (supervisor.jurisdiction === 'All' || a.jurisdiction === supervisor.jurisdiction));
      }
    }

    return {
      totalApplications: apps.length,
      pendingReview: apps.filter(a => a.status === AppStatus.UNDER_REVIEW || a.status === AppStatus.PENDING).length,
      escalatedCases: apps.filter(a => a.status === AppStatus.ESCALATED).length,
      activeGrievances: grievances.filter(g => g.status === GrievanceStatus.OPEN || g.status === GrievanceStatus.INVESTIGATING).length,
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
        // Grievances don't have dept filtering for supervisor in our simplistic model unless we link them properly, 
        // but we'll apply jurisdiction filtering
        grievances = grievances.filter(g => supervisor.jurisdiction === 'All' || g.jurisdiction === supervisor.jurisdiction);
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
