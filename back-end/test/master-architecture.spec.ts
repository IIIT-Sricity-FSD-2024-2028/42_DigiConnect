import { Test, TestingModule } from '@nestjs/testing';
import { GeographyService } from '../src/geography/geography.service';
import { CentralService } from '../src/central/central.service';
import { StateAdminService } from '../src/state-admin/state-admin.service';
import { DepartmentHeadService } from '../src/department-head/department-head.service';
import { ApplicationsService } from '../src/applications/applications.service';
import { GrievancesService } from '../src/grievances/grievances.service';
import { CertificatesService } from '../src/certificates/certificates.service';
import { UsersService } from '../src/users/users.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { AppStatus, GrievanceStatus, GrievanceResolutionAction } from '../src/models/enums';
import { db } from '../src/data/store';

describe('DigiConnect Master Architecture Verification', () => {
  let geoService: GeographyService;
  let centralService: CentralService;
  let stateAdminService: StateAdminService;
  let deptHeadService: DepartmentHeadService;
  let appsService: ApplicationsService;
  let grvService: GrievancesService;
  let certService: CertificatesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeographyService,
        CentralService,
        StateAdminService,
        DepartmentHeadService,
        ApplicationsService,
        GrievancesService,
        CertificatesService,
        UsersService,
        NotificationsService,
      ],
    }).compile();

    geoService = module.get<GeographyService>(GeographyService);
    centralService = module.get<CentralService>(CentralService);
    stateAdminService = module.get<StateAdminService>(StateAdminService);
    deptHeadService = module.get<DepartmentHeadService>(DepartmentHeadService);
    appsService = module.get<ApplicationsService>(ApplicationsService);
    grvService = module.get<GrievancesService>(GrievancesService);
    certService = module.get<CertificatesService>(CertificatesService);
  });

  describe('Pillar 1: Dynamic Jurisdiction Adjacency List Tree & Hierarchical Scoping', () => {
    it('should correctly traverse Rural ancestry from Village to State', () => {
      const ancestors = geoService.getAncestors('node_cg_vil');
      const ancestorNames = ancestors.map((a) => a.name);
      expect(ancestorNames).toContain('Chandragiri Mandal');
      expect(ancestorNames).toContain('Tirupati Revenue Sub-Division');
      expect(ancestorNames).toContain('Tirupati District');
      expect(ancestorNames).toContain('Andhra Pradesh');
    });

    it('should correctly traverse Urban ancestry from Ward to State', () => {
      const ancestors = geoService.getAncestors('node_w14');
      const ancestorNames = ancestors.map((a) => a.name);
      expect(ancestorNames).toContain('Tirupati Municipal Corporation');
      expect(ancestorNames).toContain('Tirupati Urban Sub-Division');
      expect(ancestorNames).toContain('Tirupati District');
      expect(ancestorNames).toContain('Andhra Pradesh');
    });

    it('should verify isNodeWithinScope: Mandal covers child Village, but not Urban Ward', () => {
      // Mandal covers its child village
      expect(geoService.isNodeWithinScope('node_cg_vil', 'node_cg_mdl')).toBe(true);
      // District covers both rural village and urban ward
      expect(geoService.isNodeWithinScope('node_cg_vil', 'node_tpt')).toBe(true);
      expect(geoService.isNodeWithinScope('node_w14', 'node_tpt')).toBe(true);
      // Rural Mandal does NOT cover Urban Ward
      expect(geoService.isNodeWithinScope('node_w14', 'node_cg_mdl')).toBe(false);
      // Urban Municipality covers child Ward
      expect(geoService.isNodeWithinScope('node_w14', 'node_tmc')).toBe(true);
    });

    it('should find ancestor by tier level', () => {
      const district = geoService.findParentNodeByLevel('node_cg_vil', 'DISTRICT');
      expect(district).toBeDefined();
      expect(district?.name).toBe('Tirupati District');
    });
  });

  describe('Pillar 2: Central Government & State Management', () => {
    it('should enforce 1:1 State Admin and prevent duplicate states', () => {
      expect(() => {
        centralService.createState({
          name: 'Andhra Pradesh',
          code: 'AP',
        });
      }).toThrow();
    });

    it('should compute state-wise revenue analytics', () => {
      const revenueReport = centralService.getStateWiseRevenue();
      expect(revenueReport).toBeDefined();
      expect(revenueReport.stateBreakdown.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Pillar 3: Department Head Dynamic Services & Workflows', () => {
    it('should create a designation without officer levels', () => {
      const desig = deptHeadService.createDesignation({
        departmentId: 'dept_rev_ap',
        title: 'Senior Revenue Assistant',
        code: 'SRA',
        description: 'Assists with land and revenue verifications',
      });
      expect(desig.id).toBeDefined();
      expect(desig.code).toBe('SRA');
    });

    it('should create dynamic service with custom fields, proofs, and workflow steps', () => {
      const newService = deptHeadService.createService({
        departmentId: 'dept_rev_ap',
        stateId: 'state_ap',
        name: 'Agricultural Land Mutation',
        code: 'LAND_MUTATION_TEST',
        serviceFee: 50,
        platformFee: 10,
        fields: [
          {
            id: 'survey_no',
            label: 'Land Survey Number',
            type: 'TEXT',
            required: true,
          },
          {
            id: 'extent_acres',
            label: 'Land Extent (Acres)',
            type: 'NUMBER',
            required: true,
            constraints: { min: 0.1, max: 500 },
          },
        ],
        documentRequirements: [
          {
            id: 'doc_patta',
            name: 'Pattadar Passbook / Registered Sale Deed',
            required: true,
          },
        ],
        workflowSteps: [
          {
            stepNumber: 1,
            stepName: 'VRO Verification',
            requiredDesignationId: 'desig_vro',
            canApprove: true,
            canReject: true,
            canRaiseQuery: true,
            isFinalApprovalStep: false,
          },
          {
            stepNumber: 2,
            stepName: 'Tahsildar Final Approval',
            requiredDesignationId: 'desig_tahsildar',
            canApprove: true,
            canReject: true,
            canRaiseQuery: true,
            isFinalApprovalStep: true,
          },
        ],
      });

      expect(newService.id).toBeDefined();
      expect(newService.totalFee).toBe(60);
      expect(newService.fields.length).toBe(2);
      expect(newService.workflowSteps.length).toBe(2);
    });
  });

  describe('Pillar 4: The 3 Primary Officer Actions', () => {
    let testAppId: string;

    beforeEach(() => {
      const app = appsService.submit({
        serviceId: 'srv_caste_income_ap',
        citizenId: 'CIT-1001',
        dept: 'Revenue Department',
        remarks: 'College Test Application',
        selectedJurisdictionNodeId: 'node_cg_vil',
      } as any);
      testAppId = app.id;
    });

    it('Action 1: APPROVE should advance stage and generate certificate upon final approval', () => {
      // Step 1: VRO Approves -> moves to Step 2
      const step1 = appsService.approve(testAppId, 'OFF-VRO-01', 'Documents verified.');
      expect((step1.application as any).currentStepNumber).toBe(2);
      expect(step1.certificate).toBeNull();

      // Step 2: MRO Approves -> moves to Step 3
      const step2 = appsService.approve(testAppId, 'OFF-MRO-01', 'Endorsed for issuance.');
      expect((step2.application as any).currentStepNumber).toBe(3);
      expect(step2.certificate).toBeNull();

      // Step 3: Tahsildar Approves (Final Stage) -> Generates Digital Certificate!
      (step2.application as any).isFinalStep = true;
      const step3 = appsService.approve(testAppId, 'OFF-TAH-01', 'Approved and signed.');
      expect(step3.application.status).toBe(AppStatus.COMPLETED);
      expect(step3.certificate).toBeDefined();
      expect(step3.certificate.id).toMatch(/^CERT-/);
      expect(step3.certificate.downloadUrl).toBeDefined();
    });

    it('Action 2: REJECT should permanently halt application and store rejection history', () => {
      const rejectedApp = appsService.reject(
        testAppId,
        'OFF-VRO-01',
        'Address proof mismatch with revenue records.',
      );
      expect(rejectedApp.status).toBe(AppStatus.REJECTED);
      expect((rejectedApp as any).rejectionReason).toBe(
        'Address proof mismatch with revenue records.',
      );

      // Attempting to approve rejected application should fail
      expect(() => {
        appsService.approve(testAppId, 'OFF-MRO-01', 'Trying to bypass rejection');
      }).toThrow();
    });

    it('Action 3: RAISE QUERY should pause workflow until citizen responds', () => {
      const queriedApp = appsService.raiseQuery(
        testAppId,
        'OFF-VRO-01',
        'Please upload a clearer scan of parent caste certificate.',
      );
      expect(queriedApp.status).toBe(AppStatus.QUERY_RAISED);
      expect((queriedApp as any).queries.length).toBeGreaterThan(0);

      // Citizen responds -> workflow resumes
      const resumedApp = appsService.respondToQuery(
        testAppId,
        'Uploaded high-resolution scan copy.',
        [{ name: 'parent_caste_hd.pdf', size: '1.2 MB' }],
      );
      expect(resumedApp.status).toBe(AppStatus.UNDER_REVIEW);
      expect(resumedApp.citizenResponse).toBe('Uploaded high-resolution scan copy.');
    });
  });

  describe('Pillar 5: Closed Grievance Resolution Loop (Sections 28-32)', () => {
    let rejectedAppId: string;
    let grvId: string;

    beforeEach(() => {
      // 1. Citizen submits application
      const app = appsService.submit({
        serviceId: 'srv_caste_income_ap',
        citizenId: 'CIT-1001',
        dept: 'Revenue Department',
        selectedJurisdictionNodeId: 'node_cg_vil',
      } as any);
      rejectedAppId = app.id;

      // 2. Officer rejects application
      appsService.reject(rejectedAppId, 'OFF-VRO-01', 'Insufficient proof of nativity.');

      // 3. Citizen raises grievance linked to rejected application
      const grv = grvService.raise({
        citizenId: 'CIT-1001',
        category: 'rejection_appeal',
        subject: 'Appeal against rejection of Caste Certificate',
        description: 'I have attached ancestral 1950 land records proving nativity.',
        relatedAppId: rejectedAppId,
      });
      grvId = grv.id;
    });

    it('Action A: UPHOLD REJECTION closes grievance and keeps application rejected', () => {
      const res = grvService.resolve(
        grvId,
        GrievanceResolutionAction.UPHOLD_REJECTION,
        'Nativity records insufficient per 1978 rules.',
        'GO-DIST-01',
      );
      expect(res.grievance.status).toBe(GrievanceStatus.RESOLVED);
      expect(res.application.status).toBe(AppStatus.REJECTED);
    });

    it('Action B: DIRECT RE-VERIFICATION reopens original application without erasing rejection history', () => {
      const res = grvService.resolve(
        grvId,
        GrievanceResolutionAction.DIRECT_RE_VERIFICATION,
        'New ancestral documents submitted. Reopen for Tahsildar re-investigation.',
        'GO-DIST-01',
      );
      expect(res.grievance.status).toBe(GrievanceStatus.RESOLVED);
      // Original application is REOPENED!
      expect(res.application.status).toBe(AppStatus.PENDING_REVERIFICATION);
      // Audit trail must preserve both original rejection AND grievance reopening
      const hasRejectionInTimeline = res.application.timeline.some((t: any) =>
        t.action.includes('Rejected'),
      );
      const hasReopenInTimeline = res.application.timeline.some((t: any) =>
        t.action.includes('Reopened'),
      );
      expect(hasRejectionInTimeline).toBe(true);
      expect(hasReopenInTimeline).toBe(true);
    });

    it('Action C: OVERRULE & ISSUE CERTIFICATE generates certificate and marks application completed', () => {
      const res = grvService.resolve(
        grvId,
        GrievanceResolutionAction.OVERRULE_AND_ISSUE_CERTIFICATE,
        'Rejection unjustified. Bona-fide resident verified from 1950 census.',
        'GO-DIST-01',
      );
      expect(res.grievance.status).toBe(GrievanceStatus.RESOLVED);
      expect(res.application.status).toBe(AppStatus.COMPLETED);
      expect(res.certificate).toBeDefined();
      expect(res.certificate.id).toMatch(/^CERT-/);
      expect(res.application.certificateId).toBe(res.certificate.id);
    });
  });
});
