import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../data/store';
import { Application } from '../models/application.model';
import { User } from '../models/user.model';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GeographyService } from '../geography/geography.service';
import { CertificatesService } from '../certificates/certificates.service';
import { generateId } from '../utils/helpers';
import { paginate } from '../utils/pagination.util';
import { AppStatus, GrievanceStatus } from '../models/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly geographyService: GeographyService,
    private readonly certificatesService: CertificatesService,
  ) {}

  submit(createApplicationDto: CreateApplicationDto): Application {
    let service: any = db.services.find(s => String(s.id) === String(createApplicationDto.serviceId));
    if (!service && (db as any).dynamicServices) {
      service = (db as any).dynamicServices.find((s: any) => s.id === createApplicationDto.serviceId);
    }
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

    const selectedNodeId =
      (createApplicationDto as any).selectedJurisdictionNodeId ||
      createApplicationDto.formData?.selectedJurisdictionNodeId ||
      citizen?.jurisdiction;

    // Resolve service workflow definition
    const workflowSteps = (service as any)?.workflowSteps || [];
    const step1 = workflowSteps.find((s: any) => s.stepNumber === 1);
    const requiredDesignationId = step1?.requiredDesignationId;

    // Auto-assign logic: Hybrid Jurisdiction + Workload Balancer
    // 1. If Step 1 specifies a required designation, find matching officers in the department
    let eligibleOfficers: any[] = [];
    if (requiredDesignationId) {
      const deptOfficers = db.officers.filter(o => 
        o.designationId === requiredDesignationId &&
        (!(service as any)?.departmentId || o.departmentId === (service as any)?.departmentId || (o as any).departmentName === createApplicationDto.dept)
      );
      if (deptOfficers.length > 0) {
        const leafNodeId = selectedNodeId || citizen?.jurisdiction;
        const scoped = deptOfficers.filter(o => !leafNodeId || !o.assignedNodeId || this.geographyService.isNodeWithinScope(leafNodeId, o.assignedNodeId));
        eligibleOfficers = scoped.length > 0 ? scoped : deptOfficers;
      }
    }

    if (eligibleOfficers.length === 0) {
      eligibleOfficers = this.usersService.findEligibleOfficers(
        createApplicationDto.dept, 
        selectedNodeId || citizen?.jurisdiction
      );
    }
    if (eligibleOfficers.length === 0) {
      eligibleOfficers = this.usersService.findFallbackOfficers(createApplicationDto.dept);
    }
    if (eligibleOfficers.length === 0) {
      eligibleOfficers = this.usersService.findFallbackOfficers();
    }

    if (eligibleOfficers.length === 0) {
      throw new BadRequestException(`No officers available in jurisdiction: ${selectedNodeId || citizen?.jurisdiction || 'Unknown'} for department: ${createApplicationDto.dept}`);
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

    let jurisdictionPath = citizen && citizen.jurisdiction ? citizen.jurisdiction : '-';
    if (selectedNodeId) {
      const node = db.jurisdictionNodes.find((n) => n.id === selectedNodeId);
      if (node) {
        const ancestors = this.geographyService.getAncestors(node.id);
        jurisdictionPath = [...ancestors.map((a) => a.name).reverse(), node.name].join(' > ');
      }
    }

    const slaTotalDays = (service as any)?.slaDays || (service as any)?.sla || 15;
    const nowIso = new Date().toISOString();
    const slaIso = new Date(Date.now() + slaTotalDays * 24 * 60 * 60 * 1000).toISOString();
    const assignedOffName = officer ? `${officer.name} (${officer.designationTitle || officer.designationId || 'Officer'})` : 'Unassigned';

    let stateCode = 'AP';
    if ((service as any)?.stateId) {
      stateCode = (service as any).stateId.replace('state_', '').toUpperCase();
    } else if (citizen?.stateId) {
      stateCode = citizen.stateId.replace('state_', '').toUpperCase();
    } else if (citizen?.state) {
      const s = citizen.state.toLowerCase();
      if (s.includes('andhra') || s === 'ap') stateCode = 'AP';
      else if (s.includes('karnataka') || s === 'ka') stateCode = 'KA';
      else if (s.includes('kerala') || s === 'kl') stateCode = 'KL';
      else if (s.includes('tamil') || s === 'tn') stateCode = 'TN';
    }

    const newApp: Application = {
      id: generateId('APP', stateCode),
      serviceId: createApplicationDto.serviceId,
      serviceName: service ? service.name : 'Unknown Service',
      serviceType: service ? ((service as any).category || (service as any).cat || 'certificate').toLowerCase() : 'certificate',
      citizenId: createApplicationDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
      jurisdiction: selectedNodeId || jurisdictionPath,
      officerId: officer ? officer.id : 'UNASSIGNED',
      officerName: assignedOffName,
      dept: createApplicationDto.dept,
      status: AppStatus.PENDING,
      remarks: createApplicationDto.remarks || '',
      fee: createApplicationDto.fee || 0,
      paymentMethod: createApplicationDto.paymentTransactionId ? 'online' : undefined,
      paymentStatus: createApplicationDto.paymentTransactionId ? 'paid' : 'pending',
      paymentTransactionId: createApplicationDto.paymentTransactionId,
      submittedDate: nowIso,
      slaDate: slaIso,
      timeline: [{ 
        action: 'Application Submitted', 
        stepName: 'Application Submitted',
        date: nowIso, 
        completedDate: nowIso,
        actor: citizen ? citizen.name : 'Citizen', 
        note: 'Application received online',
        remarks: 'Application received online',
        status: 'COMPLETED'
      }],
      documents: (createApplicationDto.documents || []).map((d: any) => ({
        ...d,
        date: d.date || nowIso,
      })),
      ...(createApplicationDto.formData || {}),
    };

    (newApp as any).appliedDate = nowIso;
    (newApp as any).departmentName = createApplicationDto.dept;
    (newApp as any).departmentId = (service as any)?.departmentId;
    (newApp as any).stateId = (service as any)?.stateId;
    (newApp as any).assignedOfficerId = newApp.officerId;
    (newApp as any).assignedOfficerName = assignedOffName;
    (newApp as any).slaTotal = slaTotalDays;
    (newApp as any).slaRemaining = slaTotalDays;
    (newApp as any).slaDaysRemaining = slaTotalDays;
    (newApp as any).selectedJurisdictionNodeId = selectedNodeId;
    (newApp as any).jurisdictionPath = jurisdictionPath;
    (newApp as any).currentStep = 1;
    (newApp as any).currentStepNumber = 1;
    (newApp as any).totalWorkflowSteps = workflowSteps.length > 0 ? workflowSteps.length : 3;
    (newApp as any).workflowSteps = workflowSteps;
    (newApp as any).queries = [];

    if (createApplicationDto.paymentTransactionId) {
      const pMethod = createApplicationDto.paymentMethod || 'online';
      newApp.timeline.push({ 
        action: 'Payment Confirmed', 
        stepName: 'Payment Confirmed',
        date: new Date().toISOString(), 
        completedDate: new Date().toISOString(),
        actor: 'System', 
        note: `Payment of ₹${createApplicationDto.fee} received via ${pMethod}. TXN: ${createApplicationDto.paymentTransactionId}`,
        remarks: `Payment of ₹${createApplicationDto.fee} received via ${pMethod}. TXN: ${createApplicationDto.paymentTransactionId}`,
        status: 'COMPLETED'
      });
    }

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      action: 'APPLICATION_SUBMITTED',
      actor: citizen ? citizen.name : 'Citizen',
      role: 'CITIZEN',
      date: nowIso,
      details: `Application ${newApp.id} for '${newApp.serviceName}' submitted in ${newApp.jurisdiction}.`,
    });

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

  enrichWithWorkflowStages(app: Application): any {
    const service = (db.dynamicServices || []).find((s: any) => s.id === app.serviceId) ||
                    (db.services || []).find((s: any) => s.id === app.serviceId);
    const workflowSteps = (service as any)?.workflowSteps || [];
    const leafNodeId = (app as any).selectedJurisdictionNodeId || app.jurisdiction;
    const currentStepNum = Number((app as any).currentStepNumber || (app as any).currentStep) || 1;

    const workflowStages = workflowSteps.map((step: any) => {
      const officer = db.officers.find(o => 
        o.designationId === step.requiredDesignationId &&
        this.geographyService.isNodeWithinScope(leafNodeId, o.assignedNodeId)
      ) || db.officers.find(o => o.designationId === step.requiredDesignationId);

      const isCurrent = currentStepNum === step.stepNumber;
      const isPast = currentStepNum > step.stepNumber || app.status === AppStatus.COMPLETED;
      const isEscalated = isCurrent && (app.status === AppStatus.ESCALATED || (app.status as any) === 'escalated');

      // Check if timeline has recorded this officer's activity
      const timelineEvent = (app.timeline || []).find((t: any) => 
        (t.stepName && t.stepName.toLowerCase().includes(step.stepName.toLowerCase())) ||
        (officer && t.actor && t.actor.includes(officer.name))
      );

      return {
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        requiredDesignationId: step.requiredDesignationId,
        officerId: officer?.id || 'UNASSIGNED',
        officerName: officer ? `${officer.name} (${officer.designationTitle || officer.designationId})` : 'Designated Department Officer',
        officerRole: officer?.designationTitle || step.stepName,
        status: isPast ? 'COMPLETED' : isEscalated ? 'ESCALATED' : isCurrent ? 'IN_PROGRESS' : 'PENDING',
        canApprove: step.canApprove,
        canReject: step.canReject,
        canRaiseQuery: step.canRaiseQuery,
        isFinalApprovalStep: step.isFinalApprovalStep,
        actor: timelineEvent?.actor || (officer ? `${officer.name} (${officer.designationTitle || ''})` : null),
        date: timelineEvent?.date || null,
        note: timelineEvent?.note || timelineEvent?.remarks || null,
      };
    });

    return {
      ...app,
      workflowStages,
      workflowOfficersSummary: workflowStages.length > 0 
        ? workflowStages.map((s: any) => s.officerName).join(' ➔ ')
        : (app.officerName || 'Department Officer')
    };
  }

  findByRef(ref: string): Application {
    const app = db.applications.find(a => a.id === ref);
    if (!app) throw new NotFoundException('Application not found');
    return this.enrichWithWorkflowStages(app);
  }

  findByCitizen(citizenId: string, page: number, limit: number) {
    const apps = db.applications.filter(a => a.citizenId === citizenId);
    const enriched = apps.map(a => this.enrichWithWorkflowStages(a));
    return paginate(enriched, page, limit);
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
    (app as any).currentStatus = AppStatus.UNDER_REVIEW;
    (app as any).queryMessage = null;
    app.citizenResponse = response;

    if (Array.isArray((app as any).queries)) {
      (app as any).queries.forEach((q: any) => {
        if (q.status === 'OPEN') {
          q.status = 'RESPONDED';
          q.responseNote = response;
          q.respondedAt = now.toISOString();
        }
      });
    }

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

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      action: 'QUERY_RESPONDED',
      actor: 'Citizen',
      role: 'CITIZEN',
      date: now.toISOString(),
      details: `Citizen responded to query on application ${app.id}. Review resumed.`,
    });

    if (app.officerId) {
      this.notificationsService.createNotification({
        userId: app.officerId,
        title: `📩 Citizen Responded to Query (${app.id})`,
        message: `Applicant responded to query on ${app.serviceName}: "${response.slice(0, 80)}"`,
        type: 'info',
        link: `/officer/review/${app.id}`,
      });
    }

    return this.enrichWithWorkflowStages(app);
  }

  // ─── THE 3 PRIMARY OFFICER ACTIONS (Sections 18-22) ───

  approve(appId: string, actorUserId: string, remarks?: string): { application: Application; certificate?: any } {
    const app = this.findById(appId);

    if ([AppStatus.REJECTED, AppStatus.COMPLETED].includes(app.status as AppStatus)) {
      throw new BadRequestException('Application is finalized and cannot be approved.');
    }

    const timestamp = new Date().toISOString();
    let officer = db.officers.find(o => o.id === actorUserId);
    const actorName = officer ? `${officer.name} (${officer.designationTitle})` : (actorUserId || 'Verification Officer');

    const currentStep = Number((app as any).currentStepNumber) || 1;
    const totalSteps = Number((app as any).totalWorkflowSteps) || 3;
    const nextStep = currentStep + 1;

    let certData: any = null;

    if (nextStep > totalSteps || (app as any).isFinalStep) {
      // Final Approval -> Generate Digital Certificate!
      app.status = AppStatus.COMPLETED;
      (app as any).currentStatus = AppStatus.COMPLETED;

      certData = this.certificatesService.generateCertificate({
        applicationId: app.id,
        citizenName: app.citizenName,
        serviceName: app.serviceName,
        jurisdictionPath: (app as any).jurisdictionPath || app.jurisdiction || 'State Administrative Division',
        issuingAuthority: actorName,
      });

      (app as any).certificateId = certData.id;
      (app as any).certificateIssuedDate = certData.issueDate;
      (app as any).certificateDownloadUrl = certData.downloadUrl;

      app.timeline.push({
        action: 'Final Approval & Digital Certificate Issued',
        date: timestamp,
        actor: actorName,
        actorId: actorUserId,
        officerId: actorUserId,
        note: remarks || `Application approved. Certificate ${certData.id} generated.`,
        status: 'COMPLETED',
      });

      (app as any).approvalHistory = (app as any).approvalHistory || [];
      (app as any).approvalHistory.push({
        officerId: actorUserId,
        officerName: actorName,
        stepNumber: currentStep,
        date: timestamp,
        remarks: remarks || `Application approved. Certificate ${certData.id} generated.`,
      });

      db.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'APPLICATION_APPROVED',
        actor: actorName,
        role: 'OFFICER',
        date: timestamp,
        details: `Application ${app.id} (${app.serviceName}) received final approval by ${actorName}. Certificate ${certData.id} issued.`,
        officerId: actorUserId,
      } as any);

      this.notificationsService.pushApplicationNotification(
        app.citizenId,
        app.id,
        'COMPLETED',
        `🎉 Congratulations! Your application has been approved and your Digital Certificate (${certData.id}) is ready for download.`,
      );
    } else {
      // Advance to next step
      (app as any).currentStepNumber = nextStep;
      app.status = AppStatus.PENDING_OFFICER_REVIEW;
      (app as any).currentStatus = AppStatus.PENDING_OFFICER_REVIEW;

      // Find the next step in workflow and reassign officerId / officerName
      const service = (db.dynamicServices || []).find((s: any) => s.id === app.serviceId) ||
                      (db.services || []).find((s: any) => s.id === app.serviceId);
      const workflowSteps = (service as any)?.workflowSteps || [];
      const nextStepConfig = workflowSteps.find((s: any) => s.stepNumber === nextStep);

      if (nextStepConfig && nextStepConfig.requiredDesignationId) {
        const leafNodeId = (app as any).selectedJurisdictionNodeId || app.jurisdiction;
        const nextOfficer = db.officers.find(o => 
          o.designationId === nextStepConfig.requiredDesignationId &&
          (!app.departmentId && !(app as any).dept || o.departmentId === app.departmentId || o.departmentId === (app as any).dept) &&
          this.geographyService.isNodeWithinScope(leafNodeId, o.assignedNodeId)
        ) || db.officers.find(o => 
          o.designationId === nextStepConfig.requiredDesignationId &&
          this.geographyService.isNodeWithinScope(leafNodeId, o.assignedNodeId)
        ) || db.officers.find(o => o.designationId === nextStepConfig.requiredDesignationId);

        if (nextOfficer) {
          app.officerId = nextOfficer.id;
          app.officerName = `${nextOfficer.name} (${nextOfficer.designationTitle || nextOfficer.designationId})`;
          (app as any).assignedOfficerId = nextOfficer.id;
          (app as any).assignedOfficerName = app.officerName;
        } else {
          app.officerId = '';
          app.officerName = nextStepConfig.stepName || '';
        }
      }

      (app as any).currentStep = nextStep;
      (app as any).currentStepNumber = nextStep;

      app.timeline.push({
        action: `Stage ${currentStep} Approved -> Advanced to Step ${nextStep}`,
        stepName: nextStepConfig?.stepName || `Stage ${nextStep}`,
        date: timestamp,
        completedDate: timestamp,
        actor: actorName,
        actorId: actorUserId,
        officerId: actorUserId,
        note: remarks || `Stage verified and forwarded to next officer in workflow.`,
        remarks: remarks || `Stage verified and forwarded to next officer in workflow.`,
        status: 'IN_PROGRESS',
      });

      (app as any).approvalHistory = (app as any).approvalHistory || [];
      (app as any).approvalHistory.push({
        officerId: actorUserId,
        officerName: actorName,
        stepNumber: currentStep,
        date: timestamp,
        remarks: remarks || `Stage verified and forwarded to next officer in workflow.`,
      });

      db.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        action: 'STAGE_APPROVED',
        actor: actorName,
        role: 'OFFICER',
        date: timestamp,
        details: `Application ${app.id} Stage ${currentStep} approved by ${actorName}. Advanced to Step ${nextStep}.`,
        officerId: actorUserId,
      } as any);

      this.notificationsService.pushApplicationNotification(
        app.citizenId,
        app.id,
        'UNDER_REVIEW',
        `Your application was approved by ${actorName} and moved to the next review stage.`,
      );
    }

    return { application: app, certificate: certData };
  }

  reject(appId: string, actorUserId: string, reason: string): Application {
    const app = this.findById(appId);

    if ([AppStatus.REJECTED, AppStatus.COMPLETED].includes(app.status as AppStatus)) {
      throw new BadRequestException('Application is already finalized.');
    }

    const timestamp = new Date().toISOString();
    let officer = db.officers.find(o => o.id === actorUserId);
    const actorName = officer ? `${officer.name} (${officer.designationTitle})` : (actorUserId || 'Verification Officer');

    app.status = AppStatus.REJECTED;
    (app as any).currentStatus = AppStatus.REJECTED;
    (app as any).rejectedBy = actorName;
    (app as any).rejectionReason = reason;
    (app as any).rejectionDate = timestamp;

    app.timeline.push({
      action: 'Application Rejected',
      date: timestamp,
      actor: actorName,
      actorId: actorUserId,
      officerId: actorUserId,
      note: reason || 'Application rejected during officer review.',
    });

    db.auditLogs.push({
      id: `AUD-${Date.now()}`,
      action: 'APPLICATION_REJECTED',
      actor: actorName,
      role: 'OFFICER',
      date: timestamp,
      details: `Application ${app.id} rejected by ${actorName}. Reason: ${reason}`,
      officerId: actorUserId,
    } as any);

    this.notificationsService.pushApplicationNotification(
      app.citizenId,
      app.id,
      'REJECTED',
      `Your application was rejected by ${actorName}. Reason: ${reason}`,
    );

    return app;
  }

  raiseQuery(appId: string, actorUserId: string, queryText: string): Application {
    const app = this.findById(appId);

    if ([AppStatus.REJECTED, AppStatus.COMPLETED].includes(app.status as AppStatus)) {
      throw new BadRequestException('Cannot raise query on finalized application.');
    }

    const timestamp = new Date().toISOString();
    let officer = db.officers.find(o => o.id === actorUserId);
    const actorName = officer ? `${officer.name} (${officer.designationTitle})` : (actorUserId || 'Verification Officer');

    // Workflow is PAUSED
    app.status = AppStatus.QUERY_RAISED;
    (app as any).currentStatus = AppStatus.QUERY_RAISED;

    if (!(app as any).queries) {
      (app as any).queries = [];
    }

    const queryEntry = {
      queryId: `QRY-${Date.now().toString().slice(-6)}`,
      officerId: actorUserId,
      officerName: actorName,
      queryText: queryText.trim(),
      timestamp,
      status: 'OPEN',
    };

    (app as any).queries.push(queryEntry);
    (app as any).queryMessage = queryText.trim();

    app.timeline.push({
      action: 'Clarification Query Raised (Workflow Paused)',
      date: timestamp,
      actor: actorName,
      actorId: actorUserId,
      officerId: actorUserId,
      note: queryText,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      action: 'QUERY_RAISED',
      actor: actorName,
      role: 'OFFICER',
      date: timestamp,
      details: `Clarification query raised on application ${app.id} by ${actorName}: "${queryText}"`,
      officerId: actorUserId,
    } as any);

    this.notificationsService.pushApplicationNotification(
      app.citizenId,
      app.id,
      'QUERY_RAISED',
      `Officer ${actorName} raised a query: "${queryText}". Please submit a response to resume review.`,
    );

    return app;
  }

  // ── Officer Dashboard Data with Hierarchical Scoping ──


  getOfficerQueue(officerId?: string) {
    // Actionable statuses only — completed/rejected should NOT appear in an officer's work queue
    const ACTIONABLE = [
      AppStatus.PENDING,
      AppStatus.UNDER_REVIEW,
      AppStatus.QUERY,
      AppStatus.QUERY_RAISED,
      AppStatus.PENDING_OFFICER_REVIEW,
      AppStatus.ESCALATED,
      'pending',
      'under-review',
      'query',
      'pending_officer_review',
      'escalated',
    ];

    let apps = db.applications.filter(a => ACTIONABLE.includes(a.status as any));

    if (officerId) {
      // 1. Resolve officer record from db.officers or db.users
      const officer = db.officers.find((o) => o.id === officerId);
      const userRecord = db.users.find((u) => u.id === officerId);

      const resolvedDesignationId = officer?.designationId || (userRecord as any)?.designationId || '';
      const resolvedNodeId = officer?.assignedNodeId || (userRecord as any)?.assignedNodeId || '';
      const linkedOfficerId = (userRecord as any)?.officerId || '';

      apps = apps.filter((a) => {
        const leafNodeId = (a as any).selectedJurisdictionNodeId || a.jurisdiction;
        const currentStepNum = Number((a as any).currentStepNumber || (a as any).currentStep) || 1;

        // Check service workflow definition
        const service = (db.dynamicServices || []).find((s: any) => s.id === a.serviceId) ||
                        (db.services || []).find((s: any) => s.id === a.serviceId);
        const workflowSteps = (service as any)?.workflowSteps || [];

        // Check if application has breached SLA or is escalated
        const isEscalatedOrBreached = a.status === AppStatus.ESCALATED || 
                                     (a.status as any) === 'escalated' || 
                                     (a.slaDate && new Date(a.slaDate).getTime() < Date.now());

        if (isEscalatedOrBreached) {
          // Breached & Escalated applications belong SOLELY to the higher supervisory authority (a.officerId)
          // The delinquent officer whose SLA breached NO LONGER has jurisdiction or actionable access!
          return a.officerId === officerId || (linkedOfficerId && a.officerId === linkedOfficerId);
        }

        if (workflowSteps.length > 0 && resolvedDesignationId) {
          const currentStep = workflowSteps.find((s: any) => s.stepNumber === currentStepNum);
          if (currentStep) {
            // Step must match officer's designation
            const designationMatches = currentStep.requiredDesignationId === resolvedDesignationId;
            if (!designationMatches) return false;

            // Direct assignment takes precedence if step matches
            if (a.officerId === officerId || (linkedOfficerId && a.officerId === linkedOfficerId)) {
              return true;
            }

            // Jurisdiction scope check
            if (resolvedNodeId) {
              return this.geographyService.isNodeWithinScope(leafNodeId, resolvedNodeId);
            }
            return true;
          }
        }

        // Direct officer ID assignment (e.g. manually assigned or non-stepped service) takes precedence
        if (a.officerId === officerId || (linkedOfficerId && a.officerId === linkedOfficerId)) {
          return true;
        }

        return false;
      });
    }

    // Filter out grievance-locked applications
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
      const subDateStr = a.submittedDate || (a as any).appliedDate || (a as any).createdAt || new Date().toISOString();
      const submittedDate = new Date(subDateStr);
      const slaTotalDays = (a as any).slaTotal || 15;
      const slaDateStr = a.slaDate || new Date(submittedDate.getTime() + slaTotalDays * 86400000).toISOString();
      const slaDate = new Date(slaDateStr);
      const totalDays = Math.max(1, Math.ceil((slaDate.getTime() - submittedDate.getTime()) / 86400000));
      const usedDays = Math.ceil((new Date().getTime() - submittedDate.getTime()) / 86400000);
      const now = Date.now();
      const isEscalatedStatus = a.status === AppStatus.ESCALATED || (a.status as any) === 'escalated';

      let slaLeft: number;
      if (isEscalatedStatus) {
        const diffDays = Math.ceil((slaDate.getTime() - now) / 86400000);
        slaLeft = diffDays < 0 ? diffDays : -1;
      } else if ((a as any).slaRemaining !== undefined && (a as any).slaRemaining !== null) {
        slaLeft = Number((a as any).slaRemaining);
      } else if (now > slaDate.getTime()) {
        slaLeft = Math.ceil((slaDate.getTime() - now) / 86400000);
      } else {
        slaLeft = totalDays - usedDays;
      }

      // Mask aadhaar — show only last 4 digits
      const rawAadhaar = citizenUser?.aadhaar || '';
      const maskedAadhaar = rawAadhaar.length >= 4
        ? 'XXXX XXXX ' + rawAadhaar.slice(-4)
        : rawAadhaar || 'XXXX XXXX XXXX';

      // Resolve current step permissions defined by department head
      const currentStepNum = Number((a as any).currentStepNumber) || 1;
      const svcForStep = (db.dynamicServices || []).find((s: any) => s.id === a.serviceId) ||
                         (db.services || []).find((s: any) => s.id === a.serviceId);
      const wfSteps = (svcForStep as any)?.workflowSteps || [];
      const resolvedStepConfig = wfSteps.find((s: any) => s.stepNumber === currentStepNum);
      const currentStepConfig = resolvedStepConfig ? {
        stepNumber: resolvedStepConfig.stepNumber,
        stepName: resolvedStepConfig.stepName || `Stage ${currentStepNum}`,
        canApprove: resolvedStepConfig.canApprove !== false,      // default true
        canReject: resolvedStepConfig.canReject !== false,         // default true
        canRaiseQuery: resolvedStepConfig.canRaiseQuery !== false, // default true
        isFinalApprovalStep: !!resolvedStepConfig.isFinalApprovalStep,
      } : { stepNumber: currentStepNum, stepName: `Stage ${currentStepNum}`, canApprove: true, canReject: true, canRaiseQuery: true, isFinalApprovalStep: false };

      return {
        ...a,
        service: a.serviceName,
        citizen: a.citizenName,
        phone: citizenUser ? citizenUser.phone : '',
        submitted: submittedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        slaLeft,
        slaTotal: totalDays,
        status: a.status === AppStatus.PENDING || a.status === ('pending' as any) 
          ? 'new' 
          : isEscalatedStatus 
          ? 'escalated' 
          : a.status,
        // Citizen personal details for officer review
        aadhaar: maskedAadhaar,
        dob: citizenUser?.dob || '—',
        gender: citizenUser?.gender || '—',
        address: citizenUser?.address
          ? [citizenUser.address, citizenUser.mandal, citizenUser.district, citizenUser.state, citizenUser.pincode].filter(Boolean).join(', ')
          : '—',
        // Workflow info
        currentStepNumber: currentStepNum,
        totalWorkflowSteps: (a as any).totalWorkflowSteps || wfSteps.length || 1,
        queries: (a as any).queries || [],
        // Per-step permissions set by department head — drives officer portal action buttons
        currentStepConfig,
      };
    });
  }



  getOfficerQueries(officerId?: string) {
    let apps = db.applications.filter(a =>
      a.status === AppStatus.QUERY || a.status === AppStatus.QUERY_RAISED || a.status === ('query' as any)
    );
    if (officerId) {
      const officer = db.officers.find((o) => o.id === officerId);
      const userRecord = db.users.find((u) => u.id === officerId);
      const resolvedDesignationId = officer?.designationId || (userRecord as any)?.designationId || '';
      const resolvedNodeId = officer?.assignedNodeId || (userRecord as any)?.assignedNodeId || '';
      const linkedOfficerId = (userRecord as any)?.officerId || '';

      apps = apps.filter(a => {
        const currentStepNum = Number((a as any).currentStepNumber) || 1;
        const service = (db.dynamicServices || []).find((s: any) => s.id === a.serviceId) ||
                        (db.services || []).find((s: any) => s.id === a.serviceId);
        const workflowSteps = (service as any)?.workflowSteps || [];
        if (workflowSteps.length > 0 && resolvedDesignationId) {
          const currentStep = workflowSteps.find((s: any) => s.stepNumber === currentStepNum);
          if (currentStep) {
            const designationMatches = currentStep.requiredDesignationId === resolvedDesignationId;
            if (!designationMatches) return false;
            if (a.officerId === officerId || (linkedOfficerId && a.officerId === linkedOfficerId)) return true;
            if (resolvedNodeId) {
              const leafNodeId = (a as any).selectedJurisdictionNodeId || a.jurisdiction;
              return this.geographyService.isNodeWithinScope(leafNodeId, resolvedNodeId);
            }
            return true;
          }
        }
        if (a.officerId === officerId || (linkedOfficerId && a.officerId === linkedOfficerId)) return true;
        return false;
      });
    }

    return apps.map(a => {
      const queryAction = [...a.timeline].reverse().find(t => t.action.toLowerCase().includes('query'));
      const sentDate = queryAction ? new Date(queryAction.date) : new Date();
      const deadlineDate = new Date(sentDate.getTime() + 3 * 86400000);

      return {
        id: a.id,
        appId: a.id,
        citizenId: a.citizenId,
        citizen: a.citizenName,
        citizenName: a.citizenName,
        service: a.serviceName,
        serviceName: a.serviceName,
        query: queryAction ? queryAction.note : (a as any).queryMessage || 'Additional details requested',
        sent: sentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        deadline: deadlineDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        responded: !!a.citizenResponse
      };
    });
  }

  getOfficerActivity(officerId?: string) {
    if (!officerId) return [];
    const officer = db.users.find(u => u.id === officerId) || db.officers.find(o => o.id === officerId);
    if (!officer) return [];

    return db.auditLogs
      .filter(log =>
        (log as any).officerId === officerId ||
        log.actor === officer.email ||
        log.actor === officer.name ||
        ((officer as any).designationTitle && log.actor?.includes((officer as any).designationTitle)) ||
        ((officer as any).title && log.actor?.includes((officer as any).title))
      )
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

  getOfficerApprovedTodayCount(officerId?: string): number {
    if (!officerId) return 0;
    const officer = db.officers.find(o => o.id === officerId) || db.users.find(u => u.id === officerId);
    const userRecord = db.users.find(u => u.id === officerId);
    const linkedOfficerId = (userRecord as any)?.officerId || '';
    const targetIds = [officerId, linkedOfficerId].filter(Boolean);
    const officerName = officer?.name;

    const now = new Date();

    const isToday = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const isLocalToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      const isUtcToday = dateStr.slice(0, 10) === now.toISOString().slice(0, 10);
      return isLocalToday || isUtcToday;
    };

    return (db.applications || []).filter(app => {
      // 1. Check approvalHistory if available
      if (Array.isArray((app as any).approvalHistory) && (app as any).approvalHistory.length > 0) {
        return (app as any).approvalHistory.some(
          (h: any) => targetIds.includes(h.officerId) && isToday(h.date)
        );
      }
      // 2. Timeline fallback
      return app.timeline?.some(
        t =>
          t.action?.toLowerCase().includes('approv') &&
          isToday(t.date) &&
          (targetIds.includes((t as any).officerId) || targetIds.includes((t as any).actorId) || (officerName && t.actor?.includes(officerName)))
      );
    }).length;
  }

  getOfficerSlaRisks(officerId?: string) {
    let queueApps = this.getOfficerQueue(officerId);

    return queueApps.map(a => {
      const isEscalated = a.status === AppStatus.ESCALATED || (a.status as any) === 'escalated';
      const slaLeft = typeof a.slaLeft === 'number' ? a.slaLeft : (isEscalated ? -1 : 5);
      const totalDays = Number(a.slaTotal) || 15;
      const usedDays = Math.max(0, totalDays - slaLeft);
      const pct = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
      
      return {
        id: a.id,
        status: slaLeft < 0 || isEscalated ? 'breach' : slaLeft <= 3 ? 'warn' : 'safe',
        pct: pct,
        slaLeft
      };
    }).filter(a => a.status === 'breach' || a.status === 'warn').slice(0, 5);
  }

  getOfficerWeekChart(officerId?: string) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayName = daysOfWeek[new Date().getDay()];

    // Resolve officer
    const officer = db.officers.find((o) => o.id === officerId) || db.users.find((u) => u.id === officerId);
    const designationId = (officer?.designationId || (officer as any)?.designation || '').toLowerCase();

    // Distinct baseline chart curves per officer designation (past days of week)
    let baseWeekly: { day: string; approved: number; rejected: number; query: number }[];

    if (designationId.includes('vro') || designationId.includes('vao') || designationId.includes('vo') || designationId.includes('wrs')) {
      baseWeekly = [
        { day: 'Mon', approved: 16, rejected: 1, query: 4 },
        { day: 'Tue', approved: 22, rejected: 2, query: 3 },
        { day: 'Wed', approved: 19, rejected: 1, query: 5 },
        { day: 'Thu', approved: 25, rejected: 3, query: 2 },
        { day: 'Fri', approved: 24, rejected: 0, query: 3 },
        { day: 'Sat', approved: 0, rejected: 0, query: 0 },
        { day: 'Sun', approved: 0, rejected: 0, query: 0 },
      ];
    } else if (designationId.includes('ri') || designationId.includes('inspector') || designationId.includes('dtah')) {
      baseWeekly = [
        { day: 'Mon', approved: 8, rejected: 1, query: 2 },
        { day: 'Tue', approved: 10, rejected: 2, query: 1 },
        { day: 'Wed', approved: 12, rejected: 1, query: 3 },
        { day: 'Thu', approved: 9, rejected: 2, query: 1 },
        { day: 'Fri', approved: 11, rejected: 0, query: 2 },
        { day: 'Sat', approved: 0, rejected: 0, query: 0 },
        { day: 'Sun', approved: 0, rejected: 0, query: 0 },
      ];
    } else if (designationId.includes('tah') || designationId.includes('mro') || designationId.includes('dwo') || designationId.includes('dswo')) {
      baseWeekly = [
        { day: 'Mon', approved: 4, rejected: 0, query: 1 },
        { day: 'Tue', approved: 5, rejected: 1, query: 0 },
        { day: 'Wed', approved: 5, rejected: 0, query: 1 },
        { day: 'Thu', approved: 6, rejected: 1, query: 0 },
        { day: 'Fri', approved: 6, rejected: 0, query: 1 },
        { day: 'Sat', approved: 0, rejected: 0, query: 0 },
        { day: 'Sun', approved: 0, rejected: 0, query: 0 },
      ];
    } else {
      baseWeekly = [
        { day: 'Mon', approved: 7, rejected: 1, query: 2 },
        { day: 'Tue', approved: 8, rejected: 1, query: 1 },
        { day: 'Wed', approved: 9, rejected: 0, query: 2 },
        { day: 'Thu', approved: 6, rejected: 2, query: 1 },
        { day: 'Fri', approved: 8, rejected: 0, query: 1 },
        { day: 'Sat', approved: 0, rejected: 0, query: 0 },
        { day: 'Sun', approved: 0, rejected: 0, query: 0 },
      ];
    }

    // Clone so we don't mutate shared references
    const chart = baseWeekly.map((b) => ({ ...b }));

    // Count real approvals by this specific officer today
    const liveApprovals = this.getOfficerApprovedTodayCount(officerId);

    // Sync today's real volume and reset future days
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = dayOrder.indexOf(currentDayName);
    if (currentDayIdx !== -1) {
      chart.forEach((item) => {
        const itemIdx = dayOrder.indexOf(item.day);
        if (itemIdx === currentDayIdx) {
          item.approved = liveApprovals;
        } else if (itemIdx > currentDayIdx) {
          item.approved = 0;
          item.rejected = 0;
          item.query = 0;
        }
      });
    }

    return chart;
  }

  // ── Supervisor Dashboard Data ──

  getSupervisorApprovalQueue() {
    return db.superOfficerApproved;
  }

  getSuperPendingApps() {
    return db.superPendingApps;
  }
}
