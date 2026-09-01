export enum Role {
  CENTRAL_ADMIN = 'CENTRAL_ADMIN',
  STATE_ADMIN = 'STATE_ADMIN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  OFFICER = 'OFFICER',
  GRIEVANCE_OFFICER = 'GRIEVANCE_OFFICER',
  CITIZEN = 'CITIZEN',
  // Backward compatibility aliases
  SUPER_USER = 'super_user',
  SUPERVISOR = 'supervisor',
  GRIEVANCE = 'grievance',
}

export function normalizeRole(role: string | undefined | null): Role | null {
  if (!role) return null;
  const upper = role.trim().toUpperCase();
  if (upper === 'CENTRAL_ADMIN' || upper === 'SUPER_USER' || upper === 'SUPERUSER' || upper === 'ADMIN') {
    return Role.CENTRAL_ADMIN;
  }
  if (upper === 'STATE_ADMIN' || upper === 'STATEADMIN') {
    return Role.STATE_ADMIN;
  }
  if (upper === 'DEPARTMENT_HEAD' || upper === 'DEPT_HEAD' || upper === 'SUPERVISOR') {
    return Role.DEPARTMENT_HEAD;
  }
  if (upper === 'OFFICER') {
    return Role.OFFICER;
  }
  if (upper === 'GRIEVANCE_OFFICER' || upper === 'GRIEVANCE') {
    return Role.GRIEVANCE_OFFICER;
  }
  if (upper === 'CITIZEN') {
    return Role.CITIZEN;
  }
  return null;
}

export type GovernanceType = 'RURAL' | 'URBAN' | 'COMMON';

export type TierLevel =
  | 'STATE'
  | 'DISTRICT'
  | 'SUB_DIVISION'
  | 'MANDAL'
  | 'MUNICIPALITY'
  | 'VILLAGE'
  | 'GRAM_PANCHAYAT'
  | 'WARD'
  | 'ZONE';

export enum AppStatus {
  PENDING = 'pending',
  DRAFT = 'DRAFT',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  SUBMITTED = 'SUBMITTED',
  PENDING_OFFICER_REVIEW = 'PENDING_OFFICER_REVIEW',
  UNDER_REVIEW = 'under-review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  QUERY = 'query',
  QUERY_RAISED = 'QUERY_RAISED',
  PENDING_EXTERNAL_VERIFICATION = 'pending_external_verification',
  PENDING_REVERIFICATION = 'PENDING_REVERIFICATION',
  FINAL_APPROVAL = 'FINAL_APPROVAL',
  CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED',
  COMPLETED = 'completed',
}

export enum GrievanceStatus {
  SUBMITTED = 'SUBMITTED',
  OPEN = 'open',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INVESTIGATING = 'investigating',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  DISMISSED = 'DISMISSED',
  ESCALATED_RESOLVED = 'escalated-resolved',
}

export enum GrievanceResolutionAction {
  UPHOLD_REJECTION = 'UPHOLD_REJECTION',
  DIRECT_RE_VERIFICATION = 'DIRECT_RE_VERIFICATION',
  OVERRULE_AND_ISSUE_CERTIFICATE = 'OVERRULE_AND_ISSUE_CERTIFICATE',
}
