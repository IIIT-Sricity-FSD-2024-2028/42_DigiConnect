import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../data/store';
import { Application } from '../models/application.model';
import { User } from '../models/user.model';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { generateId } from '../utils/helpers';
import { paginate } from '../utils/pagination.util';
import { AppStatus, GrievanceStatus } from '../models/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  submit(createApplicationDto: CreateApplicationDto): Application {
    const service = db.services.find(s => s.id === createApplicationDto.serviceId);
    if (!service) {
      throw new NotFoundException(`Service not found with ID: ${createApplicationDto.serviceId}`);
    }
    let citizen: User | null = null;
    try {
      citizen = this.usersService.findById(createApplicationDto.citizenId);
    } catch (e) {
      // Citizen not found, handled below
    }
    
    // Verify Payment Handshake Simulation
    if (createApplicationDto.fee && createApplicationDto.fee > 0) {
      if (!createApplicationDto.paymentTransactionId) {
        throw new BadRequestException('Payment transaction ID is required for paid services. Please complete the payment gateway simulation first.');
      }
    }

    // Auto-assign logic: Hybrid Jurisdiction + Workload Balancer
    // 1. Filter officers by department AND jurisdiction matching the citizen
    let eligibleOfficers = this.usersService.findEligibleOfficers(
      createApplicationDto.dept, 
      citizen ? citizen.jurisdiction : undefined
    );

    if (eligibleOfficers.length === 0) {
      throw new BadRequestException(`No officers available in jurisdiction: ${citizen ? citizen.jurisdiction : 'Unknown'} for department: ${createApplicationDto.dept}`);
    }

    // 2. Workload Balancer: Find the officer with the fewest active applications
    let officer = eligibleOfficers[0];
    let minLoad = Infinity;

    for (const off of eligibleOfficers) {
      const activeLoad = db.applications.filter(a => 
        a.officerId === off.id && 
        (a.status === AppStatus.PENDING || a.status === AppStatus.UNDER_REVIEW || a.status === AppStatus.QUERY)
      ).length;

      if (activeLoad < minLoad) {
        minLoad = activeLoad;
        officer = off;
      }
    }
    const newApp: Application = {
      id: generateId('APP'),
      serviceId: createApplicationDto.serviceId,
      serviceName: service ? service.name : 'Unknown Service',
      serviceType: service ? service.cat.toLowerCase() : 'unknown',
      citizenId: createApplicationDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
      jurisdiction: citizen && citizen.jurisdiction ? citizen.jurisdiction : '-',
      officerId: officer ? officer.id : 'UNASSIGNED',
      officerName: officer ? officer.name : 'Unassigned',
      dept: createApplicationDto.dept,
      status: AppStatus.PENDING,
      remarks: createApplicationDto.remarks || '',
      fee: createApplicationDto.fee || 0,
      paymentMethod: createApplicationDto.paymentTransactionId ? 'online' : undefined,
      paymentStatus: createApplicationDto.paymentTransactionId ? 'paid' : 'pending',
      paymentTransactionId: createApplicationDto.paymentTransactionId,
      submittedDate: new Date().toISOString(),
      slaDate: new Date(Date.now() + (service ? service.sla : 7) * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [{ action: 'Application Submitted', date: new Date().toISOString(), actor: citizen ? citizen.name : 'Citizen', note: 'Application received' }],
      documents: createApplicationDto.documents || [],
      ...(createApplicationDto.formData || {})
    };

    if (createApplicationDto.paymentTransactionId) {
      const pMethod = createApplicationDto.paymentMethod || 'online';
      newApp.timeline.push({ 
        action: 'Payment Confirmed', 
        date: new Date().toISOString(), 
        actor: 'System', 
        note: `Payment of ₹${createApplicationDto.fee} received via ${pMethod}. TXN: ${createApplicationDto.paymentTransactionId}` 
      });
    }

    db.applications.unshift(newApp); // Add to beginning
    return newApp;
  }

  findAll(page: number, limit: number, officerId?: string, status?: string) {
    let apps = db.applications;
    if (officerId) apps = apps.filter(a => a.officerId === officerId);
    if (status) apps = apps.filter(a => a.status === status);
    return paginate(apps, page, limit);
  }

  findById(id: string): Application {
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  findByRef(ref: string): Application {
    const app = db.applications.find(a => a.id === ref);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  findByCitizen(citizenId: string, page: number, limit: number) {
    const apps = db.applications.filter(a => a.citizenId === citizenId);
    return paginate(apps, page, limit);
  }

  updateStatus(id: string, updateStatusDto: UpdateStatusDto, actorUserId: string): Application {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const app = db.applications[appIndex];

    // Terminal State Lock
    if ([AppStatus.REJECTED, AppStatus.COMPLETED].includes(app.status as AppStatus)) {
      throw new BadRequestException('This application has already been finalized and cannot be modified.');
    }

    // Grievance API Lock
    const activeGrievance = db.grievances.find(g => 
      g.relatedAppId === id && 
      (g.category === 'misconduct' || g.status === GrievanceStatus.ESCALATED) &&
      g.status !== GrievanceStatus.RESOLVED && 
      g.status !== GrievanceStatus.REJECTED &&
      g.status !== 'escalated-resolved'
    );

    if (activeGrievance) {
      throw new BadRequestException('Application Locked: Under review by Grievance/Appellate Authority.');
    }

    app.status = updateStatusDto.status;
    if (updateStatusDto.remarks) app.remarks = updateStatusDto.remarks;
    
    let resolvedActorName = actorUserId || 'Officer';
    if (actorUserId && actorUserId !== 'System' && actorUserId !== 'Officer') {
      try {
        const user = this.usersService.findById(actorUserId);
        resolvedActorName = user.name;
      } catch (e) {
        // Fallback
      }
    }

    app.timeline.push({
      action: `Status updated to ${updateStatusDto.status}`,
      date: new Date().toISOString(),
      actor: resolvedActorName,
      note: updateStatusDto.remarks || ''
    });

    db.applications[appIndex] = app;

    // Auto-push notification to citizen
    this.notificationsService.pushApplicationNotification(
      app.citizenId,
      app.id,
      updateStatusDto.status,
      updateStatusDto.remarks || ''
    );

    return app;
  }

  requestVerification(appId: string, targetDept: string, reason: string, actorUserId: string): Application {
    const mainApp = this.findById(appId);
    if (mainApp.status === AppStatus.PENDING_EXTERNAL_VERIFICATION) {
      throw new BadRequestException('Application is already pending verification');
    }

    // Spawn Sub-Task Application
    const subAppDto: CreateApplicationDto = {
      serviceId: mainApp.serviceId,
      citizenId: mainApp.citizenId,
      dept: targetDept,
      remarks: `[SUB-TASK Verification] ${reason}`,
      documents: mainApp.documents
    };

    const subApp = this.submit(subAppDto);
    subApp.parentAppId = mainApp.id;

    let resolvedActorName = actorUserId || 'Officer';
    if (actorUserId && actorUserId !== 'System' && actorUserId !== 'Officer') {
      try {
        const user = this.usersService.findById(actorUserId);
        resolvedActorName = user.name;
      } catch (e) {
        // Fallback
      }
    }

    // Update Main App
    mainApp.status = AppStatus.PENDING_EXTERNAL_VERIFICATION;
    mainApp.timeline.push({
      action: `External Verification Requested`,
      date: new Date().toISOString(),
      actor: resolvedActorName,
      note: `Sent to ${targetDept}. Reason: ${reason}. Sub-Task ID: ${subApp.id}`
    });

    return mainApp;
  }

  resolveVerification(subAppId: string, remarks: string, actorUserId: string): Application {
    const subAppIndex = db.applications.findIndex(a => a.id === subAppId);
    if (subAppIndex === -1) throw new NotFoundException('Sub-task not found');
    const subApp = db.applications[subAppIndex];

    if (!subApp.parentAppId) throw new BadRequestException('Not a valid sub-task');

    const mainAppIndex = db.applications.findIndex(a => a.id === subApp.parentAppId);
    if (mainAppIndex === -1) throw new NotFoundException('Main application not found');
    const mainApp = db.applications[mainAppIndex];

    let resolvedActorName = actorUserId || 'Officer';
    if (actorUserId && actorUserId !== 'System' && actorUserId !== 'Officer') {
      try {
        const user = this.usersService.findById(actorUserId);
        resolvedActorName = user.name;
      } catch (e) {
        // Fallback
      }
    }

    // Complete Sub-Task
    subApp.status = AppStatus.COMPLETED;
    subApp.remarks = remarks;
    subApp.timeline.push({
      action: 'Verification Completed',
      date: new Date().toISOString(),
      actor: resolvedActorName,
      note: remarks
    });

    // Unlock Main App
    mainApp.status = AppStatus.UNDER_REVIEW;
    mainApp.timeline.push({
      action: 'External Verification Completed',
      date: new Date().toISOString(),
      actor: 'System',
      note: `Verification received from ${subApp.dept}. Remarks: ${remarks}`
    });

    return mainApp;
  }

  remove(id: string): void {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');
    db.applications.splice(appIndex, 1);
  }

  respondToQuery(id: string, response: string, newDocs: any[] = []): Application {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');
    const app = db.applications[appIndex];
    
    // Check if SLA was breached while waiting for citizen
    const now = new Date();
    const currentSla = new Date(app.slaDate);
    if (now.getTime() > currentSla.getTime()) {
      // SLA breached during query wait time. Reset it to give officer 3 fresh days.
      const newSla = new Date();
      newSla.setDate(newSla.getDate() + 3);
      app.slaDate = newSla.toISOString();
      app.timeline.push({
        action: 'SLA Extended',
        date: now.toISOString(),
        actor: 'System',
        note: 'SLA deadline extended by 3 days following citizen response.'
      });
    }

    app.status = AppStatus.UNDER_REVIEW;
    app.citizenResponse = response;

    if (!app.documents) app.documents = [];
    if (newDocs && newDocs.length > 0) {
      app.documents.push(...newDocs);
    }

    app.timeline.push({
      action: 'Query Responded',
      date: now.toISOString(),
      actor: 'Citizen',
      note: response
    });
    return app;
  }

  // ── Officer Dashboard Data ──

  getOfficerQueue(officerId?: string) {
    let apps = db.applications;
    if (officerId) apps = apps.filter(a => a.officerId === officerId);

    // Filter out locked applications
    apps = apps.filter(a => {
      const activeGrievance = db.grievances.find(g => 
        g.relatedAppId === a.id && 
        (g.category === 'misconduct' || g.status === GrievanceStatus.ESCALATED) &&
        g.status !== GrievanceStatus.RESOLVED && 
        g.status !== GrievanceStatus.REJECTED &&
        g.status !== 'escalated-resolved'
      );
      return !activeGrievance;
    });

    return apps.map(a => {
      const citizenUser = db.users.find(u => u.id === a.citizenId);
      const submittedDate = new Date(a.submittedDate);
      const slaDate = new Date(a.slaDate);
      const totalDays = Math.max(1, Math.ceil((slaDate.getTime() - submittedDate.getTime()) / 86400000));
      const usedDays = Math.ceil((new Date().getTime() - submittedDate.getTime()) / 86400000);
      const slaLeft = totalDays - usedDays;

      // Mask aadhaar — show only last 4 digits
      const rawAadhaar = citizenUser?.aadhaar || '';
      const maskedAadhaar = rawAadhaar.length >= 4
        ? 'XXXX XXXX ' + rawAadhaar.slice(-4)
        : rawAadhaar || 'XXXX XXXX XXXX';

      return {
        ...a,
        service: a.serviceName,
        citizen: a.citizenName,
        phone: citizenUser ? citizenUser.phone : '',
        submitted: submittedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        slaLeft,
        slaTotal: totalDays,
        status: a.status === AppStatus.PENDING ? 'new' : a.status,
        // Citizen personal details for officer review
        aadhaar: maskedAadhaar,
        dob: citizenUser?.dob || '—',
        gender: citizenUser?.gender || '—',
        address: citizenUser?.address
          ? [citizenUser.address, citizenUser.mandal, citizenUser.district, citizenUser.state, citizenUser.pincode].filter(Boolean).join(', ')
          : '—',
      };
    });
  }


  getOfficerQueries(officerId?: string) {
    let apps = db.applications.filter(a => a.status === AppStatus.QUERY);
    if (officerId) apps = apps.filter(a => a.officerId === officerId);

    return apps.map(a => {
      const queryAction = [...a.timeline].reverse().find(t => t.action.toLowerCase().includes('query'));
      const sentDate = queryAction ? new Date(queryAction.date) : new Date();
      const deadlineDate = new Date(sentDate.getTime() + 3 * 86400000);

      return {
        id: a.id,
        citizen: a.citizenName,
        service: a.serviceName,
        query: queryAction ? queryAction.note : 'Additional details requested',
        sent: sentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        deadline: deadlineDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        responded: !!a.citizenResponse
      };
    });
  }

  getOfficerActivity(officerId?: string) {
    if (!officerId) return [];
    const officer = db.users.find(u => u.id === officerId);
    if (!officer) return [];

    return db.auditLogs
      .filter(log => log.actor === officer.email || log.actor === officer.name)
      .slice(0, 10)
      .map(log => {
        let icon = 'check';
        let color = 'var(--green-500)';
        if (log.action.toLowerCase().includes('reject')) { icon = 'reject'; color = 'var(--red-500)'; }
        if (log.action.toLowerCase().includes('query')) { icon = 'query'; color = 'var(--amber-500)'; }
        if (log.action.toLowerCase().includes('login')) { icon = 'login'; color = 'var(--navy-500)'; }

        return {
          icon, color,
          msg: log.details,
          time: new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      });
  }

  getOfficerSlaRisks(officerId?: string) {
    let apps = db.applications.filter(a => a.status !== AppStatus.APPROVED && a.status !== AppStatus.COMPLETED && a.status !== AppStatus.REJECTED);
    if (officerId) apps = apps.filter(a => a.officerId === officerId);

    return apps.map(a => {
      const submittedDate = new Date(a.submittedDate);
      const slaDate = new Date(a.slaDate);
      const totalDays = Math.max(1, Math.ceil((slaDate.getTime() - submittedDate.getTime()) / 86400000));
      const usedDays = Math.ceil((new Date().getTime() - submittedDate.getTime()) / 86400000);
      const slaLeft = totalDays - usedDays;
      const pct = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
      
      return {
        id: a.id,
        status: slaLeft < 0 ? 'breach' : slaLeft <= 2 ? 'warn' : 'safe',
        pct: pct,
        slaLeft
      };
    }).filter(a => a.status === 'breach' || a.status === 'warn').slice(0, 5);
  }

  getOfficerWeekChart(officerId?: string) {
    return db.officerWeekChart;
  }

  // ── Supervisor Dashboard Data ──

  getSupervisorApprovalQueue() {
    return db.superOfficerApproved;
  }

  getSuperPendingApps() {
    return db.superPendingApps;
  }
}
