import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db } from '../data/store';
import { TransitionDto } from './dto/transition.dto';
import { AppStatus } from '../models/enums';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);
  getConfig(): Record<AppStatus, AppStatus[]> {
    return {
      [AppStatus.PENDING]: [AppStatus.UNDER_REVIEW, AppStatus.REJECTED, AppStatus.PENDING_EXTERNAL_VERIFICATION],
      [AppStatus.UNDER_REVIEW]: [AppStatus.APPROVED, AppStatus.REJECTED, AppStatus.QUERY, AppStatus.ESCALATED, AppStatus.PENDING_EXTERNAL_VERIFICATION],
      [AppStatus.QUERY]: [AppStatus.UNDER_REVIEW], // Citizen responds to query
      [AppStatus.PENDING_EXTERNAL_VERIFICATION]: [AppStatus.UNDER_REVIEW],
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

  @Cron(CronExpression.EVERY_MINUTE)
  handleSlaBreaches() {
    this.logger.debug('Running SLA Sweeper Cron Job...');
    const now = new Date().getTime();
    let escalatedCount = 0;

    for (let i = 0; i < db.applications.length; i++) {
      const app = db.applications[i];
      if (app.status === AppStatus.PENDING || app.status === AppStatus.UNDER_REVIEW || app.status === AppStatus.QUERY) {
        const slaTime = new Date(app.slaDate).getTime();
        if (now > slaTime) {
          app.status = AppStatus.ESCALATED;
          app.timeline.push({
            action: 'Status transitioned to escalated',
            date: new Date().toISOString(),
            actor: 'System Daemon',
            note: 'Auto-Escalated due to SLA breach'
          });
          
          db.auditLogs.unshift({
            id: `LOG-${Math.floor(Math.random() * 10000)}`,
            action: 'Auto-Escalation',
            actor: 'System Daemon',
            role: 'System',
            date: new Date().toISOString(),
            details: `Application ${app.id} auto-escalated (SLA Breached)`
          });
          
          escalatedCount++;
        }
      }
    }
    
    if (escalatedCount > 0) {
      this.logger.warn(`Auto-escalated ${escalatedCount} applications due to SLA breach.`);
    }
  }
}
