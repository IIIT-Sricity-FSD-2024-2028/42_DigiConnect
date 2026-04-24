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
import { AppStatus } from '../models/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  submit(createApplicationDto: CreateApplicationDto): Application {
    const service = db.services.find(s => s.id === createApplicationDto.serviceId);
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
      paymentStatus: createApplicationDto.paymentTransactionId ? 'paid' : 'pending',
      submittedDate: new Date().toISOString(),
      slaDate: new Date(Date.now() + (service ? service.sla : 7) * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [{ action: 'Application Submitted', date: new Date().toISOString(), actor: citizen ? citizen.name : 'Citizen', note: 'Application received' }],
      documents: createApplicationDto.documents || []
    };

    if (createApplicationDto.paymentTransactionId) {
      newApp.timeline.push({ action: 'Payment Confirmed', date: new Date().toISOString(), actor: 'System', note: `Payment of ₹${createApplicationDto.fee} received via Razorpay simulator. TXN: ${createApplicationDto.paymentTransactionId}` });
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

  updateStatus(id: string, updateStatusDto: UpdateStatusDto, actorName: string): Application {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const app = db.applications[appIndex];
    app.status = updateStatusDto.status;
    if (updateStatusDto.remarks) app.remarks = updateStatusDto.remarks;
    
    app.timeline.push({
      action: `Status updated to ${updateStatusDto.status}`,
      date: new Date().toISOString(),
      actor: actorName,
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

  requestVerification(appId: string, targetDept: string, reason: string, actorName: string): Application {
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

    // Update Main App
    mainApp.status = AppStatus.PENDING_EXTERNAL_VERIFICATION;
    mainApp.timeline.push({
      action: `External Verification Requested`,
      date: new Date().toISOString(),
      actor: actorName,
      note: `Sent to ${targetDept}. Reason: ${reason}. Sub-Task ID: ${subApp.id}`
    });

    return mainApp;
  }

  resolveVerification(subAppId: string, remarks: string, actorName: string): Application {
    const subAppIndex = db.applications.findIndex(a => a.id === subAppId);
    if (subAppIndex === -1) throw new NotFoundException('Sub-task not found');
    const subApp = db.applications[subAppIndex];

    if (!subApp.parentAppId) throw new BadRequestException('Not a valid sub-task');

    const mainAppIndex = db.applications.findIndex(a => a.id === subApp.parentAppId);
    if (mainAppIndex === -1) throw new NotFoundException('Main application not found');
    const mainApp = db.applications[mainAppIndex];

    // Complete Sub-Task
    subApp.status = AppStatus.COMPLETED;
    subApp.remarks = remarks;
    subApp.timeline.push({
      action: 'Verification Completed',
      date: new Date().toISOString(),
      actor: actorName,
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

  respondToQuery(id: string, response: string): Application {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');
    const app = db.applications[appIndex];
    
    app.status = AppStatus.UNDER_REVIEW;
    app.citizenResponse = response;
    app.timeline.push({
      action: 'Query Responded',
      date: new Date().toISOString(),
      actor: 'Citizen',
      note: response
    });
    return app;
  }
}
