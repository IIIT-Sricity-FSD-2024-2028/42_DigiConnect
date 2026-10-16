import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApplicationsService } from './applications/applications.service';
import { GrievancesService } from './grievances/grievances.service';
import { UsersService } from './users/users.service';
import { GeographyService } from './geography/geography.service';
import { NotificationsService } from './notifications/notifications.service';
import { CertificatesService } from './certificates/certificates.service';
import { AppStatus, GrievanceStatus, GrievanceResolutionAction } from './models/enums';
import { UpdateGrievanceDto, normalizeGrievanceStatus } from './grievances/dto/update-grievance.dto';
import { db } from './data/store';
import {
  checkDelayEligibility,
  checkRejectionEligibility,
  checkMisconductEligibility,
  checkTechnicalEligibility,
  checkWrongInfoEligibility,
  checkOtherEligibility,
  evaluateCategoryEligibility,
  evaluateAllGrievanceEligibility,
} from './grievances/grievance-eligibility.util';

describe('Fix 1 & Fix 2 Targeted Verification Tests', () => {
  let appsService: ApplicationsService;
  let grvService: GrievancesService;
  let usersService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        GrievancesService,
        UsersService,
        GeographyService,
        NotificationsService,
        CertificatesService,
      ],
    }).compile();

    appsService = module.get<ApplicationsService>(ApplicationsService);
    grvService = module.get<GrievancesService>(GrievancesService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('Fix 1: Applicant Name Persistence and Separation', () => {
    it('should persist applicant first and last names with the application while keeping citizen account name unchanged', () => {
      // Citizen profile account is CIT-AP-001 (Ravi Kumar)
      const citizen = usersService.findById('CIT-AP-001');
      expect(citizen).toBeDefined();
      const originalCitizenName = citizen.name;

      // Citizen applies on behalf of applicant "Aarav Sharma"
      const created = appsService.submit({
        serviceId: 'srv_caste_income_ap',
        citizenId: 'CIT-AP-001',
        dept: 'Revenue Department',
        selectedJurisdictionNodeId: 'node_cg_vil',
        applicantFirstName: 'Aarav',
        applicantLastName: 'Sharma',
        fee: 50,
        paymentTransactionId: 'TXN-APP-001',
        remarks: 'Applying for dependent',
      });

      expect(created).toBeDefined();
      expect(created.applicantFirstName).toBe('Aarav');
      expect(created.applicantLastName).toBe('Sharma');
      expect(created.applicantName).toBe('Aarav Sharma');

      // Citizen profile name remains completely untouched and separate
      expect(created.citizenName).toBe(originalCitizenName);
      const citizenAfter = usersService.findById('CIT-AP-001');
      expect(citizenAfter.name).toBe(originalCitizenName);
    });

    it('should accept firstName and lastName aliases in payload and persist correctly', () => {
      const citizen = usersService.findById('CIT-AP-001');
      const originalCitizenName = citizen.name;

      const created = appsService.submit({
        serviceId: 'srv_caste_income_ap',
        citizenId: 'CIT-AP-001',
        dept: 'Revenue Department',
        selectedJurisdictionNodeId: 'node_cg_vil',
        firstName: 'Priya',
        lastName: 'Verma',
        fee: 50,
        paymentTransactionId: 'TXN-APP-002',
      });

      expect(created.applicantFirstName).toBe('Priya');
      expect(created.applicantLastName).toBe('Verma');
      expect(created.applicantName).toBe('Priya Verma');
      expect(created.citizenName).toBe(originalCitizenName);
    });

    it('should handle legacy/older applications without applicant name fields safely', () => {
      const legacyApp: any = {
        id: 'APP-LEGACY-001',
        serviceId: 'srv_caste_income_ap',
        serviceName: 'Integrated Certificate',
        citizenId: 'CIT-AP-001',
        citizenName: 'Ravi Kumar',
        status: AppStatus.PENDING,
        dept: 'Revenue Department',
        submittedDate: new Date().toISOString(),
        timeline: [],
      };

      const enriched = appsService.enrichWithWorkflowStages(legacyApp);
      // Fallback safely to citizenName without error
      expect(enriched.applicantName).toBe('Ravi Kumar');
      expect(enriched.citizenName).toBe('Ravi Kumar');
    });

    it('should extract applicant name from legacy formData if present', () => {
      const legacyWithFormData: any = {
        id: 'APP-LEGACY-002',
        serviceId: 'srv_caste_income_ap',
        serviceName: 'Integrated Certificate',
        citizenId: 'CIT-AP-001',
        citizenName: 'Ravi Kumar',
        status: AppStatus.PENDING,
        dept: 'Revenue Department',
        formData: {
          firstName: 'Vikram',
          lastName: 'Reddy',
        },
        submittedDate: new Date().toISOString(),
        timeline: [],
      };

      const enriched = appsService.enrichWithWorkflowStages(legacyWithFormData);
      expect(enriched.applicantName).toBe('Vikram Reddy');
      expect(enriched.citizenName).toBe('Ravi Kumar');
    });
  });

  describe('Fix 2: Category-Based Grievance Eligibility Rules', () => {
    const fixedNow = new Date('2026-05-15T12:00:00Z').getTime();

    describe('A. Delay in Service', () => {
      it('should be locked if less than 75% of configured SLA has elapsed', () => {
        // 10-day SLA = 240 hours. 50% elapsed = 5 days (120 hours).
        const app = {
          id: 'APP-D1',
          status: AppStatus.PENDING,
          slaDays: 10,
          submittedDate: new Date(fixedNow - 5 * 24 * 60 * 60 * 1000).toISOString(),
          slaDate: new Date(fixedNow + 5 * 24 * 60 * 60 * 1000).toISOString(),
          timeline: [
            { action: 'Application Submitted', date: new Date(fixedNow - 5 * 24 * 60 * 60 * 1000).toISOString() },
          ],
        };

        const result = checkDelayEligibility(app, fixedNow);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('75% SLA threshold');
      });

      it('should unlock when at least 75% of SLA has elapsed AND no progress for 3+ consecutive days', () => {
        // 10-day SLA. 8 days elapsed (80% > 75%). Last progress was submitted date (8 days ago > 3 days).
        const app = {
          id: 'APP-D2',
          status: AppStatus.PENDING,
          slaDays: 10,
          submittedDate: new Date(fixedNow - 8 * 24 * 60 * 60 * 1000).toISOString(),
          slaDate: new Date(fixedNow + 2 * 24 * 60 * 60 * 1000).toISOString(),
          timeline: [
            { action: 'Application Submitted', date: new Date(fixedNow - 8 * 24 * 60 * 60 * 1000).toISOString() },
          ],
        };

        const result = checkDelayEligibility(app, fixedNow);
        expect(result.isEligible).toBe(true);
        expect(result.reason).toContain('Over 75% SLA elapsed with no workflow progress for 3+ consecutive days');
      });

      it('should stay locked if >= 75% SLA elapsed BUT meaningful workflow progress occurred within 3 days', () => {
        // 10-day SLA. 8 days elapsed. But an inspection occurred 1 day ago.
        const app = {
          id: 'APP-D3',
          status: AppStatus.UNDER_REVIEW,
          slaDays: 10,
          submittedDate: new Date(fixedNow - 8 * 24 * 60 * 60 * 1000).toISOString(),
          slaDate: new Date(fixedNow + 2 * 24 * 60 * 60 * 1000).toISOString(),
          timeline: [
            { action: 'Application Submitted', date: new Date(fixedNow - 8 * 24 * 60 * 60 * 1000).toISOString() },
            {
              action: 'Field Inspection Completed',
              stepName: 'Inspection',
              date: new Date(fixedNow - 1 * 24 * 60 * 60 * 1000).toISOString(),
              completedDate: new Date(fixedNow - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        };

        const result = checkDelayEligibility(app, fixedNow);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('no meaningful workflow progress has occurred for at least 3 consecutive days');
      });

      it('should unlock immediately if SLA deadline has passed and application is unresolved', () => {
        // Deadline was 1 day ago, still pending
        const app = {
          id: 'APP-D4',
          status: AppStatus.UNDER_REVIEW,
          slaDays: 10,
          submittedDate: new Date(fixedNow - 12 * 24 * 60 * 60 * 1000).toISOString(),
          slaDate: new Date(fixedNow - 2 * 24 * 60 * 60 * 1000).toISOString(),
          timeline: [
            {
              action: 'Document Verification',
              stepName: 'Verification',
              date: new Date(fixedNow - 1 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        };

        const result = checkDelayEligibility(app, fixedNow);
        expect(result.isEligible).toBe(true);
        expect(result.reason).toContain('SLA deadline has passed without resolution');
      });

      it('should NOT unlock if application is already resolved, even if deadline has passed', () => {
        const app = {
          id: 'APP-D5',
          status: AppStatus.COMPLETED,
          slaDays: 10,
          submittedDate: new Date(fixedNow - 20 * 24 * 60 * 60 * 1000).toISOString(),
          slaDate: new Date(fixedNow - 10 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const result = checkDelayEligibility(app, fixedNow);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('already finalized/resolved');
      });
    });

    describe('B. Wrongful Rejection', () => {
      it('should unlock ONLY when application has an actual recorded rejection decision', () => {
        const rejectedApp = {
          id: 'APP-R1',
          status: AppStatus.REJECTED,
          timeline: [
            { action: 'Application Rejected', date: new Date().toISOString() },
          ],
        };
        const result = checkRejectionEligibility(rejectedApp);
        expect(result.isEligible).toBe(true);
      });

      it('should stay locked for pending or under-review applications', () => {
        const underReviewApp = {
          id: 'APP-R2',
          status: AppStatus.UNDER_REVIEW,
          timeline: [],
        };
        const result = checkRejectionEligibility(underReviewApp);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('rejection decision is recorded');
      });
    });

    describe('C. Officer Misconduct', () => {
      it('should unlock once an officer is assigned to the application', () => {
        const assignedApp = {
          id: 'APP-M1',
          officerId: 'off_001',
          officerName: 'Suresh Kumar (VRO)',
        };
        const result = checkMisconductEligibility(assignedApp);
        expect(result.isEligible).toBe(true);
      });

      it('should stay locked when no officer is assigned', () => {
        const unassignedApp = {
          id: 'APP-M2',
          officerId: 'UNASSIGNED',
          officerName: 'Unassigned',
          timeline: [],
        };
        const result = checkMisconductEligibility(unassignedApp);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('once an officer is assigned');
      });
    });

    describe('D. Technical Issue', () => {
      it('should unlock immediately after successful application submission', () => {
        const submittedApp = {
          id: 'APP-T1',
          status: AppStatus.PENDING,
          submittedDate: new Date().toISOString(),
        };
        const result = checkTechnicalEligibility(submittedApp);
        expect(result.isEligible).toBe(true);
      });
    });

    describe('E. Wrong Information Issued', () => {
      it('should unlock only after the certificate or document has actually been issued', () => {
        const completedApp = {
          id: 'APP-W1',
          status: AppStatus.COMPLETED,
          certificateId: 'CERT-AP-12345',
        };
        const result = checkWrongInfoEligibility(completedApp);
        expect(result.isEligible).toBe(true);
      });

      it('should unlock if certificate generated is recorded in timeline', () => {
        const appWithCertTimeline = {
          id: 'APP-W2',
          status: AppStatus.APPROVED,
          timeline: [
            { action: 'Certificate Generated and Digitally Signed', date: new Date().toISOString() },
          ],
        };
        const result = checkWrongInfoEligibility(appWithCertTimeline);
        expect(result.isEligible).toBe(true);
      });

      it('should stay locked while application is pending or under review without issued document', () => {
        const underReviewApp = {
          id: 'APP-W3',
          status: AppStatus.UNDER_REVIEW,
          timeline: [],
        };
        const result = checkWrongInfoEligibility(underReviewApp);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('certificate or document has actually been issued');
      });
    });

    describe('F. Other Issue', () => {
      it('should stay locked if application submission was less than 1 day (24 hours) ago', () => {
        // Submitted 12 hours ago
        const freshApp = {
          id: 'APP-O1',
          submittedDate: new Date(fixedNow - 12 * 60 * 60 * 1000).toISOString(),
        };
        const result = checkOtherEligibility(freshApp, fixedNow);
        expect(result.isEligible).toBe(false);
        expect(result.reason).toContain('Available after 1 day');
      });

      it('should unlock once 1 day (24 hours) has elapsed since application submission', () => {
        // Submitted 25 hours ago
        const matureApp = {
          id: 'APP-O2',
          submittedDate: new Date(fixedNow - 25 * 60 * 60 * 1000).toISOString(),
        };
        const result = checkOtherEligibility(matureApp, fixedNow);
        expect(result.isEligible).toBe(true);
      });
    });

    describe('Centralized Eligibility Engine Integration', () => {
      it('should return eligibility evaluations for all 6 categories via evaluateAllGrievanceEligibility', () => {
        const app = {
          id: 'APP-ALL',
          status: AppStatus.PENDING,
          officerId: 'off_001',
          submittedDate: new Date(fixedNow - 2 * 24 * 60 * 60 * 1000).toISOString(),
        };
        const results = evaluateAllGrievanceEligibility(app, fixedNow);
        expect(Object.keys(results)).toEqual([
          'delay',
          'rejection',
          'misconduct',
          'technical',
          'wrong-info',
          'other',
        ]);
        expect(results.misconduct.isEligible).toBe(true);
        expect(results.technical.isEligible).toBe(true);
        expect(results.other.isEligible).toBe(true);
        expect(results.rejection.isEligible).toBe(false);
        expect(results['wrong-info'].isEligible).toBe(false);
      });
    });

    describe('Backend Grievance Submission Enforcement', () => {
      let testAppId: string;

      beforeAll(() => {
        // Create an application in store that is fresh (under-review, no cert, not rejected)
        const app = appsService.submit({
          serviceId: 'srv_caste_income_ap',
          citizenId: 'CIT-AP-001',
          dept: 'Revenue Department',
          selectedJurisdictionNodeId: 'node_cg_vil',
          applicantFirstName: 'Rohit',
          applicantLastName: 'Verma',
          fee: 50,
          paymentTransactionId: 'TXN-GRV-TEST',
        });
        testAppId = app.id;
      });

      it('should reject submission with BadRequestException if category is ineligible', () => {
        // Attempting to file "Wrongful Rejection" on a newly submitted pending app
        expect(() => {
          grvService.raise({
            citizenId: 'CIT-AP-001',
            relatedAppId: testAppId,
            category: 'Wrongful Rejection',
            subject: 'Improper rejection claim',
            description: 'Why was this rejected?',
          });
        }).toThrow(BadRequestException);
      });

      it('should succeed with grievance filing if category is eligible (e.g. Technical Issue)', () => {
        const grv = grvService.raise({
          citizenId: 'CIT-AP-001',
          relatedAppId: testAppId,
          category: 'Technical Issue',
          subject: 'Payment receipt download error',
          description: 'The PDF failed to download upon receipt generation.',
        });

        expect(grv).toBeDefined();
        expect(grv.id).toMatch(/^GRV-/);
        expect(grv.relatedAppId).toBe(testAppId);
        expect(grv.category).toBe('Technical Issue');
      });

      it('should allow fetching category eligibility status via getEligibility()', () => {
        const eligibilityMap = grvService.getEligibility(testAppId);
        expect(eligibilityMap).toBeDefined();
        expect(eligibilityMap.technical.isEligible).toBe(true);
        expect(eligibilityMap.rejection.isEligible).toBe(false);
      });
    });
  });

  describe('Grievance Redressal Workflow Regression Tests (Bugs 1, 2, 3)', () => {
    describe('Bug 1: Status Validation & Normalization in UpdateGrievanceDto', () => {
      it('should succeed when status is omitted from payload (e.g. review remarks update)', async () => {
        const payload = {
          remarks: 'Review Phase Completed — Citizen grounds and documents verified.',
        };
        const dto = plainToInstance(UpdateGrievanceDto, payload);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
        expect(dto.remarks).toBe(payload.remarks);
        expect(dto.status).toBeUndefined();
      });

      it('should correctly normalize and validate UNDER_REVIEW status variants', async () => {
        for (const rawStatus of ['UNDER_REVIEW', 'under-review', 'under_review']) {
          const dto = plainToInstance(UpdateGrievanceDto, { status: rawStatus });
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
          expect(dto.status).toBe(GrievanceStatus.UNDER_REVIEW);
        }
      });

      it('should correctly normalize and validate investigating, open, and submitted statuses', async () => {
        const cases = [
          { input: 'investigating', expected: GrievanceStatus.INVESTIGATING },
          { input: 'INVESTIGATING', expected: GrievanceStatus.INVESTIGATING },
          { input: 'open', expected: GrievanceStatus.OPEN },
          { input: 'OPEN', expected: GrievanceStatus.OPEN },
          { input: 'submitted', expected: GrievanceStatus.SUBMITTED },
          { input: 'SUBMITTED', expected: GrievanceStatus.SUBMITTED },
        ];
        for (const c of cases) {
          const dto = plainToInstance(UpdateGrievanceDto, { status: c.input });
          const errors = await validate(dto);
          expect(errors.length).toBe(0);
          expect(dto.status).toBe(c.expected);
        }
      });

      it('should reject genuinely invalid status values with validation error', async () => {
        const dto = plainToInstance(UpdateGrievanceDto, { status: 'INVALID_STATUS_FOO' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('status');
      });
    });

    describe('Bug 2 & 3: Persistence and Stage Transition in GrievancesService', () => {
      let workflowGrvId: string;

      beforeAll(() => {
        // Create an eligible application and file a fresh grievance
        const app = appsService.submit({
          serviceId: 'srv_caste_income_ap',
          citizenId: 'CIT-AP-001',
          dept: 'Revenue Department',
          selectedJurisdictionNodeId: 'node_cg_vil',
          applicantFirstName: 'Vikas',
          applicantLastName: 'Swaminathan',
          fee: 50,
          paymentTransactionId: 'TXN-WORKFLOW-TEST',
        });

        const grv = grvService.raise({
          citizenId: 'CIT-AP-001',
          relatedAppId: app.id,
          category: 'Technical Issue',
          subject: 'Form portal submission bug report',
          description: 'Encountered page freeze during document upload.',
        });
        workflowGrvId = grv.id;
      });

      it('Stage 1 -> Stage 2: should update status to UNDER_REVIEW on review completion without error', () => {
        const updated = grvService.updateStatus(
          workflowGrvId,
          {
            status: GrievanceStatus.UNDER_REVIEW,
            remarks: 'Review Phase Completed — Citizen grounds and documents verified.',
          },
          'Test Grievance Officer',
        );

        expect(updated).toBeDefined();
        expect(updated.status).toBe(GrievanceStatus.UNDER_REVIEW);
        expect(updated.remarks).toContain('Review Phase Completed');
        expect(updated.history.some((h) => h.action.includes('UNDER_REVIEW'))).toBe(true);
      });

      it('Stage 2: should persist updated category and priority onto the grievance record', () => {
        const updated = grvService.updateStatus(
          workflowGrvId,
          {
            status: GrievanceStatus.INVESTIGATING,
            category: 'delay',
            priority: 'high',
            remarks: 'Categorized as Service Delay with high priority.',
          },
          'Test Grievance Officer',
        );

        expect(updated.status).toBe(GrievanceStatus.INVESTIGATING);
        expect(updated.category).toBe('delay');
        expect(updated.priority).toBe('high');

        // Verify stored in DB reference
        const stored = grvService.findById(workflowGrvId);
        expect(stored.category).toBe('delay');
        expect(stored.priority).toBe('high');
      });

      it('Revisiting Stage 2: should allow editing category and priority and keep them updated', () => {
        const reUpdated = grvService.updateStatus(
          workflowGrvId,
          {
            category: 'technical',
            priority: 'urgent',
            remarks: 'Re-categorized following inquiry revisit.',
          },
          'Test Grievance Officer',
        );

        expect(reUpdated.category).toBe('technical');
        expect(reUpdated.priority).toBe('urgent');
        expect(reUpdated.status).toBe(GrievanceStatus.INVESTIGATING); // Retained existing status

        const stored = grvService.findById(workflowGrvId);
        expect(stored.category).toBe('technical');
        expect(stored.priority).toBe('urgent');
      });

      it('Stage 3 -> Stage 4: should allow investigation completion remarks and proceed to resolution', () => {
        const updated = grvService.updateStatus(
          workflowGrvId,
          {
            status: GrievanceStatus.INVESTIGATING,
            remarks: 'Investigation Phase Completed — Findings compiled and verified.',
          },
          'Test Grievance Officer',
        );

        expect(updated.status).toBe(GrievanceStatus.INVESTIGATING);
        expect(updated.remarks).toContain('Investigation Phase Completed');
      });

      it('Stage 4: should execute resolution and record outcome correctly', () => {
        const result = grvService.resolve(
          workflowGrvId,
          GrievanceResolutionAction.DIRECT_RE_VERIFICATION,
          'Directing field officer to re-verify technical documents.',
          'Appellate Officer',
        );

        expect(result.grievance.status).toBe(GrievanceStatus.RESOLVED);
        expect(result.grievance.closedDate).toBeDefined();
        expect(result.grievance.resolvedBy).toBe('Appellate Officer');
        expect((result.grievance as any).resolutionAction).toBe(
          GrievanceResolutionAction.DIRECT_RE_VERIFICATION,
        );

        const stored = grvService.findById(workflowGrvId);
        expect(stored.status).toBe(GrievanceStatus.RESOLVED);
      });
    });
  });
});

