import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../data/store';
import { Grievance } from '../models/grievance.model';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';
import { generateId } from '../utils/helpers';
import { User } from '../models/user.model';
import { paginate } from '../utils/pagination.util';
import { GrievanceStatus, GrievanceResolutionAction, AppStatus } from '../models/enums';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class GrievancesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly certificatesService: CertificatesService,
  ) {}

  raise(createGrievanceDto: CreateGrievanceDto): Grievance {
    let citizen: User | null = null;
    try {
      citizen = this.usersService.findById(createGrievanceDto.citizenId);
    } catch(e) {}
    
    // Auto assign to a grievance officer
    const officer = this.usersService.findOfficerByRole('grievance');

    const newGrievance: Grievance = {
      id: generateId('GRV'),
      citizenId: createGrievanceDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
      jurisdiction: citizen && citizen.jurisdiction ? citizen.jurisdiction : '-',
      officerId: officer ? officer.id : 'UNASSIGNED',
      officerName: officer ? officer.name : 'Unassigned',
      category: createGrievanceDto.category,
      subject: createGrievanceDto.subject,
      description: createGrievanceDto.description,
      relatedAppId: createGrievanceDto.relatedAppId,
      status: GrievanceStatus.OPEN,
      priority: createGrievanceDto.priority || 'medium',
      slaStatus: 'safe',
      evidence: createGrievanceDto.evidence || [],
      filedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      history: [{ action: 'Grievance Filed', date: new Date().toISOString(), actor: citizen ? citizen.name : 'Citizen', note: 'Grievance submitted' }]
    };

    db.grievances.unshift(newGrievance);
    return newGrievance;
  }

  findAll(page: number, limit: number, userId?: string) {
    let filteredGrievances = db.grievances;

    if (userId) {
      let officer: User | null = null;
      try {
        officer = this.usersService.findById(userId);
      } catch(e) {}
      if (officer && officer.role === 'grievance') {
        const jurisdiction = officer.jurisdiction;
        filteredGrievances = db.grievances.filter(g =>
          g.officerId === userId ||
          (g as any).assignedOfficerId === userId ||
          (officer.email && g.officerId === officer.email) ||
          (jurisdiction && jurisdiction !== 'All' && (g.jurisdiction === jurisdiction || g.jurisdiction.startsWith(jurisdiction))) ||
          (g.stateId && officer.stateId && g.stateId === officer.stateId && (g.departmentId === officer.dept || !officer.dept))
        );
      }
    }

    return paginate(filteredGrievances, page, limit);
  }

  findById(id: string): Grievance {
    const grievance = db.grievances.find(g => g.id === id);
    if (!grievance) throw new NotFoundException('Grievance not found');
    return grievance;
  }

  findByCitizen(citizenId: string, page: number, limit: number) {
    const grievances = db.grievances.filter(g => g.citizenId === citizenId);
    return paginate(grievances, page, limit);
  }

  updateStatus(id: string, updateGrievanceDto: UpdateGrievanceDto, actorName: string): Grievance {
    const grievanceIndex = db.grievances.findIndex(g => g.id === id);
    if (grievanceIndex === -1) throw new NotFoundException('Grievance not found');

    const grievance = db.grievances[grievanceIndex];
    grievance.status = updateGrievanceDto.status;
    grievance.lastUpdated = new Date().toISOString();
    const note = updateGrievanceDto.resolutionNote || updateGrievanceDto.remarks || '';
    if (note) {
      grievance.remarks = note;
      grievance.resolutionNote = note;
    }
    if (['resolved', 'rejected', 'escalated-resolved'].includes(updateGrievanceDto.status)) {
      grievance.closedDate = new Date().toISOString();
      grievance.resolvedBy = actorName;
    }
    
    grievance.history.push({
      action: `Status updated to ${updateGrievanceDto.status}`,
      date: new Date().toISOString(),
      actor: actorName,
      note: note
    });

    db.grievances[grievanceIndex] = grievance;

    // Auto-push notification to citizen
    this.notificationsService.pushGrievanceNotification(
      grievance.citizenId,
      grievance.id,
      updateGrievanceDto.status
    );

    return grievance;
  }

  addReply(id: string, reply: string, userId: string): Grievance {
    const grievanceIndex = db.grievances.findIndex(g => g.id === id);
    if (grievanceIndex === -1) throw new NotFoundException('Grievance not found');

    const grievance = db.grievances[grievanceIndex];
    if (grievance.citizenId !== userId) {
      throw new BadRequestException('Not authorized to reply to this grievance');
    }

    grievance.lastUpdated = new Date().toISOString();
    grievance.history.push({
      action: 'Citizen Update',
      date: new Date().toISOString(),
      actor: 'Citizen',
      note: reply
    });

    db.grievances[grievanceIndex] = grievance;
    return grievance;
  }

  /**
   * CRITICAL REQUIREMENT — RESOLVING THE GRIEVANCE LOOP (Sections 28-32)
   * The grievance resolution screen explicitly provides 3 resolution actions:
   * 1. UPHOLD REJECTION: Grievance = RESOLVED, Application = REJECTED
   * 2. DIRECT RE-VERIFICATION: Grievance = RESOLVED, Application = REOPENED / PENDING_REVERIFICATION
   * 3. OVERRULE & ISSUE CERTIFICATE: Grievance = RESOLVED, Application = COMPLETED, Certificate = GENERATED
   */
  resolve(
    id: string,
    action: GrievanceResolutionAction,
    remarks: string,
    actorId: string,
  ): { grievance: Grievance; application?: any; certificate?: any } {
    const grievanceIndex = db.grievances.findIndex((g) => g.id === id);
    if (grievanceIndex === -1) throw new NotFoundException(`Grievance '${id}' not found`);

    const grievance = db.grievances[grievanceIndex];
    const timestamp = new Date().toISOString();
    const actorName = actorId || 'Grievance Officer';

    grievance.status = GrievanceStatus.RESOLVED;
    (grievance as any).resolutionAction = action;
    (grievance as any).resolutionRemarks = remarks;
    grievance.resolutionNote = remarks;
    grievance.remarks = remarks;
    grievance.closedDate = timestamp;
    grievance.resolvedBy = actorName;
    grievance.lastUpdated = timestamp;

    grievance.history.push({
      action: `Grievance Resolved: ${action}`,
      date: timestamp,
      actor: actorName,
      note: remarks,
    });

    let linkedApp: any = null;
    let issuedCert: any = null;

    if (grievance.relatedAppId) {
      linkedApp = db.applications.find((a) => a.id === grievance.relatedAppId);
    }

    if (linkedApp) {
      if (action === GrievanceResolutionAction.UPHOLD_REJECTION) {
        // 1. Uphold Rejection
        linkedApp.status = AppStatus.REJECTED;
        linkedApp.timeline.push({
          action: 'Grievance Decision: Rejection Upheld',
          date: timestamp,
          actor: actorName,
          note: `Grievance ${grievance.id} reviewed. Original rejection upheld. Remarks: ${remarks}`,
        });

        this.notificationsService.pushGrievanceNotification(
          grievance.citizenId,
          grievance.id,
          'resolved: Rejection Upheld',
        );
      } else if (action === GrievanceResolutionAction.DIRECT_RE_VERIFICATION) {
        // 2. Direct Re-verification: Application REOPENED, reinjected into verification queue!
        // Preserves complete original rejection history!
        const prevStatus = linkedApp.status;
        linkedApp.status = AppStatus.PENDING_REVERIFICATION;
        linkedApp.currentStatus = AppStatus.PENDING_REVERIFICATION;
        (linkedApp as any).reopenedByGrievanceId = grievance.id;
        (linkedApp as any).reopenedAt = timestamp;

        linkedApp.timeline.push({
          action: 'Application Reopened (Direct Re-verification)',
          date: timestamp,
          actor: actorName,
          note: `Reopened following Grievance ${grievance.id}. Prior status: ${prevStatus}. Reason: ${remarks}`,
        });

        // Audit Log
        db.auditLogs.push({
          id: `AUD-${Date.now()}`,
          action: 'APPLICATION_REOPENED_BY_GRIEVANCE',
          actor: actorName,
          role: 'GRIEVANCE_OFFICER',
          date: timestamp,
          details: `Application ${linkedApp.id} reopened through Direct Re-verification on Grievance ${grievance.id}`,
        });

        // Notify Citizen & Officer
        this.notificationsService.pushApplicationNotification(
          linkedApp.citizenId,
          linkedApp.id,
          'REOPENED',
          `Your application has been reopened for re-verification following grievance review.`,
        );
      } else if (action === GrievanceResolutionAction.OVERRULE_AND_ISSUE_CERTIFICATE) {
        // 3. Overrule & Issue Certificate: Original rejection is overruled, Certificate generated!
        linkedApp.status = AppStatus.COMPLETED;
        linkedApp.currentStatus = AppStatus.COMPLETED;
        (linkedApp as any).overruledByGrievanceId = grievance.id;
        (linkedApp as any).overruledAt = timestamp;

        // Generate Digital Demo Certificate
        issuedCert = this.certificatesService.generateCertificate({
          applicationId: linkedApp.id,
          citizenName: linkedApp.citizenName,
          serviceName: linkedApp.serviceName,
          jurisdictionPath: linkedApp.jurisdiction || 'State Administrative Division',
          issuingAuthority: 'Appellate Authority & Grievance Redressal Officer',
        });

        (linkedApp as any).certificateId = issuedCert.id;
        (linkedApp as any).certificateIssuedDate = issuedCert.issueDate;
        (linkedApp as any).certificateDownloadUrl = issuedCert.downloadUrl;

        linkedApp.timeline.push({
          action: 'Rejection Overruled & Certificate Issued',
          date: timestamp,
          actor: actorName,
          note: `Grievance ${grievance.id}: Original rejection overruled. Certificate ${issuedCert.id} generated. Remarks: ${remarks}`,
        });

        // Audit Log
        db.auditLogs.push({
          id: `AUD-${Date.now()}`,
          action: 'REJECTION_OVERRULED_CERTIFICATE_ISSUED',
          actor: actorName,
          role: 'GRIEVANCE_OFFICER',
          date: timestamp,
          details: `Overruled rejection for ${linkedApp.id} under Grievance ${grievance.id}. Certificate ${issuedCert.id} generated.`,
        });

        // Notify Citizen
        this.notificationsService.pushApplicationNotification(
          linkedApp.citizenId,
          linkedApp.id,
          'COMPLETED',
          `🎉 Grievance Approved: Original rejection overruled! Your Digital Certificate (${issuedCert.id}) is ready.`,
        );
      }
    }

    db.grievances[grievanceIndex] = grievance;

    return {
      grievance,
      application: linkedApp,
      certificate: issuedCert,
    };
  }
}
