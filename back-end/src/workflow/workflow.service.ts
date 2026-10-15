import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db } from '../data/store';
import { TransitionDto } from './dto/transition.dto';
import { AppStatus, GrievanceStatus, Role } from '../models/enums';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}
  getConfig() {
    // Return service-level workflow configs for the UI workflow-config page
    return db.workflowConfig || [];
  }

  getValidNextStatuses(status: string): AppStatus[] {
    switch (status) {
      case AppStatus.PENDING:
        return [AppStatus.UNDER_REVIEW, AppStatus.REJECTED, AppStatus.PENDING_EXTERNAL_VERIFICATION];
      case AppStatus.UNDER_REVIEW:
        return [AppStatus.APPROVED, AppStatus.REJECTED, AppStatus.QUERY, AppStatus.ESCALATED, AppStatus.PENDING_EXTERNAL_VERIFICATION];
      case AppStatus.QUERY:
        return [AppStatus.UNDER_REVIEW];
      case AppStatus.PENDING_EXTERNAL_VERIFICATION:
        return [AppStatus.UNDER_REVIEW];
      case AppStatus.ESCALATED:
        return [AppStatus.UNDER_REVIEW, AppStatus.APPROVED, AppStatus.REJECTED];
      case AppStatus.APPROVED:
        return [AppStatus.COMPLETED];
      case AppStatus.REJECTED:
      case AppStatus.COMPLETED:
      default:
        return [];
    }
  }

  updateConfig(updatedWorkflow: any) {
    const idx = (db.workflowConfig || []).findIndex((w: any) => w.id === updatedWorkflow.id);
    if (idx !== -1) {
      db.workflowConfig[idx] = { ...db.workflowConfig[idx], ...updatedWorkflow };
    }
    return db.workflowConfig;
  }

  transition(transitionDto: TransitionDto) {
    const appIndex = db.applications.findIndex(a => a.id === transitionDto.appId);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const app = db.applications[appIndex];
    
    // Check if transition is valid
    const validNextStatuses = this.getValidNextStatuses(app.status);
    
    if (!validNextStatuses.includes(transitionDto.newStatus)) {
      throw new BadRequestException(`Invalid transition from ${app.status} to ${transitionDto.newStatus}`);
    }

    app.status = transitionDto.newStatus;
    if (transitionDto.remarks) app.remarks = transitionDto.remarks;
    
    let resolvedActorName = transitionDto.actorName || 'System';
    let resolvedRole = 'System';
    if (transitionDto.actorName && transitionDto.actorName !== 'System') {
      try {
        const user = this.usersService.findById(transitionDto.actorName);
        resolvedActorName = user.name;
        resolvedRole = user.role.toUpperCase();
      } catch (e) {
        // Fallback to original value
      }
    }

    app.timeline.push({
      action: `Status transitioned to ${transitionDto.newStatus}`,
      date: new Date().toISOString(),
      actor: resolvedActorName,
      note: transitionDto.remarks || ''
    });

    db.applications[appIndex] = app;

    // Log the action universally
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 10000)}`,
      action: 'Application Status Transition',
      actor: resolvedActorName,
      role: resolvedRole,
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

    for (const app of db.applications) {
      if (app.status === AppStatus.PENDING || app.status === AppStatus.UNDER_REVIEW) {
        // Skip SLA auto-escalation if the application is locked by a grievance
        const isLocked = db.grievances.some(g => 
          g.relatedAppId === app.id && 
          (g.category === 'misconduct' || g.status === GrievanceStatus.ESCALATED) &&
          g.status !== GrievanceStatus.RESOLVED && 
          g.status !== GrievanceStatus.REJECTED &&
          g.status !== GrievanceStatus.ESCALATED_RESOLVED
        );
        if (isLocked) continue;

        const slaTime = new Date(app.slaDate).getTime();
        const hasSlaRemaining = typeof (app as any).slaRemaining === 'number';
        const isBreached = hasSlaRemaining ? (app as any).slaRemaining <= 0 : (now > slaTime);
        if (isBreached) {
          const prevOfficer = app.officerName || 'Field Officer';
          const service = (db.dynamicServices || []).find((s: any) => s.id === app.serviceId) ||
                          (db.services || []).find((s: any) => s.id === app.serviceId);
          const workflowSteps = (service as any)?.workflowSteps || [];
          const currentStepNum = Number((app as any).currentStepNumber || (app as any).currentStep) || 1;
          const isAtFinalStep = workflowSteps.length > 0 && currentStepNum >= workflowSteps.length;
          let higherOfficer: any = null;

          if (!isAtFinalStep && workflowSteps.length > 0) {
            const nextStepConfig = workflowSteps.find((s: any) => s.stepNumber === currentStepNum + 1);
            if (nextStepConfig && nextStepConfig.requiredDesignationId) {
              higherOfficer = db.officers.find(o => 
                o.designationId === nextStepConfig.requiredDesignationId &&
                o.departmentId === (app as any).departmentId
              ) || db.officers.find(o => o.designationId === nextStepConfig.requiredDesignationId);
              if (higherOfficer) {
                (app as any).currentStepNumber = nextStepConfig.stepNumber;
              }
            }
          }

          // If breached at final approval step (e.g. Tahsildar / MRO) or next step officer unassigned:
          // Escalate upward to Appellate Authority / Grievance Redressal Officer / Department Head
          if (!higherOfficer) {
            higherOfficer = db.officers.find(o => 
              o.departmentId === (app as any).departmentId &&
              (o.designationId?.includes('grv2') || (o.designationTitle || '').toLowerCase().includes('appellate'))
            ) || db.officers.find(o => 
              o.departmentId === (app as any).departmentId &&
              (o.designationId?.includes('grv1') || (o.designationTitle || '').toLowerCase().includes('grievance'))
            ) || db.users.find(u => 
              (u.role === Role.DEPARTMENT_HEAD || (u as any).backendRole === Role.DEPARTMENT_HEAD) &&
              (u as any).departmentId === (app as any).departmentId
            );
          }

          if (higherOfficer) {
            app.officerId = higherOfficer.id;
            app.officerName = `${higherOfficer.name} (${higherOfficer.designationTitle || higherOfficer.designationId || 'Supervisory Authority'})`;
            (app as any).assignedOfficerId = higherOfficer.id;
            (app as any).assignedOfficerName = app.officerName;
            (app as any).escalatedFrom = prevOfficer;
          }

          app.status = AppStatus.ESCALATED;
          const noteText = isAtFinalStep
            ? `SLA Breached at Final Statutory Authority ${prevOfficer}. Escalated to State Appellate Authority ${app.officerName} for priority administrative overrule.`
            : higherOfficer 
              ? `SLA Breached at ${prevOfficer}. Escalated to supervisory authority ${app.officerName} for priority intervention.`
              : `Auto-Escalated due to SLA breach at ${prevOfficer}.`;

          app.timeline.push({
            action: 'Auto-Escalated to Higher Authority',
            date: new Date().toISOString(),
            actor: 'System Daemon',
            note: noteText,
          });
          
          db.auditLogs.unshift({
            id: `LOG-${Math.floor(Math.random() * 10000)}`,
            action: 'Auto-Escalation',
            actor: 'System Daemon',
            role: 'System',
            date: new Date().toISOString(),
            details: `Application ${app.id} auto-escalated (SLA Breached at ${prevOfficer} → Escalated to ${app.officerName})`
          });

          // Auto-push notification to citizen
          try {
            this.notificationsService.pushApplicationNotification(
              app.citizenId,
              app.id,
              AppStatus.ESCALATED,
              'Auto-Escalated due to SLA breach'
            );
          } catch (e) {
            this.logger.error(`Failed to push SLA escalation notification for ${app.id}: ${e.message}`);
          }
          
          escalatedCount++;
        }
      }
    }
    
    if (escalatedCount > 0) {
      this.logger.warn(`Auto-escalated ${escalatedCount} applications due to SLA breach.`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  handleQueryTimeout() {
    this.logger.debug('Running Query Timeout Daemon...');
    const now = new Date().getTime();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    let rejectedCount = 0;

    for (const app of db.applications) {
      if (app.status === AppStatus.QUERY) {
        const slaTime = new Date(app.slaDate).getTime();
        const slaBreach = now - slaTime;

        // Reject only if SLA is breached AND 3+ more days have passed with no citizen response
        if (slaBreach > THREE_DAYS_MS) {
          app.status = AppStatus.REJECTED;
          app.remarks = 'Auto-rejected: Citizen did not respond to officer query within 3 days of SLA breach.';
          app.timeline.push({
            action: 'Auto-Rejected (Query Timeout)',
            date: new Date().toISOString(),
            actor: 'System Daemon',
            note: 'Citizen failed to respond to officer query within 3 days of SLA breach.'
          });

          // Auto-push notification to citizen
          try {
            this.notificationsService.pushApplicationNotification(
              app.citizenId,
              app.id,
              AppStatus.REJECTED,
              'Auto-rejected due to citizen query timeout after SLA breach.'
            );
          } catch (e) {
            this.logger.error(`Failed to push query timeout rejection notification for ${app.id}: ${e.message}`);
          }

          db.auditLogs.unshift({
            id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
            action: 'Auto-Rejection (Query Timeout)',
            actor: 'System Daemon',
            role: 'System',
            date: new Date().toISOString(),
            details: `Application ${app.id} auto-rejected — citizen query timeout after SLA breach.`
          });

          rejectedCount++;
        }
      }
    }

    if (rejectedCount > 0) {
      this.logger.warn(`Auto-rejected ${rejectedCount} applications due to citizen query timeout.`);
    }
  }
}
