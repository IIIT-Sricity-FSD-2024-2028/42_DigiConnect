import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { TransitionDto } from './dto/transition.dto';
import { AppStatus } from '../models/enums';

@Injectable()
export class WorkflowService {
  getConfig(): Record<AppStatus, AppStatus[]> {
    return {
      [AppStatus.PENDING]: [AppStatus.UNDER_REVIEW, AppStatus.REJECTED],
      [AppStatus.UNDER_REVIEW]: [AppStatus.APPROVED, AppStatus.REJECTED, AppStatus.QUERY, AppStatus.ESCALATED],
      [AppStatus.QUERY]: [AppStatus.UNDER_REVIEW], // Citizen responds to query
      [AppStatus.ESCALATED]: [AppStatus.UNDER_REVIEW, AppStatus.APPROVED, AppStatus.REJECTED], // Supervisor acts
      [AppStatus.APPROVED]: [AppStatus.COMPLETED],
      [AppStatus.REJECTED]: [],
      [AppStatus.COMPLETED]: []
    };
  }

  transition(transitionDto: TransitionDto) {
    const appIndex = db.applications.findIndex(a => a.id === transitionDto.appId);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const app = db.applications[appIndex];
    
    // Check if transition is valid
    const config = this.getConfig();
    const validNextStatuses = config[app.status] || [];
    
    if (!validNextStatuses.includes(transitionDto.newStatus)) {
      throw new Error(`Invalid transition from ${app.status} to ${transitionDto.newStatus}`);
    }

    app.status = transitionDto.newStatus;
    if (transitionDto.remarks) app.remarks = transitionDto.remarks;
    
    app.timeline.push({
      action: `Status transitioned to ${transitionDto.newStatus}`,
      date: new Date().toISOString(),
      actor: transitionDto.actorName || 'System',
      note: transitionDto.remarks || ''
    });

    db.applications[appIndex] = app;

    // Log the action universally
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 10000)}`,
      action: 'Application Status Transition',
      actor: transitionDto.actorName || 'System',
      role: 'System', // Could determine role but leaving generic for now
      date: new Date().toISOString(),
      details: `Application ${app.id} moved to ${transitionDto.newStatus}`
    });

    return app;
  }

  getHistory(appId: string) {
    const app = db.applications.find(a => a.id === appId);
    if (!app) throw new NotFoundException('Application not found');
    return app.timeline;
  }

  getAuditLogs() {
    return db.auditLogs;
  }
}
