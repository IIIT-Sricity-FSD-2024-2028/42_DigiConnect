export enum Role {
  CITIZEN = 'citizen',
  OFFICER = 'officer',
  SUPERVISOR = 'supervisor',
  GRIEVANCE = 'grievance',
  SUPER_USER = 'super_user',
}

export enum AppStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under-review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  QUERY = 'query',
  COMPLETED = 'completed',
}

export enum GrievanceStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  ESCALATED_RESOLVED = 'escalated-resolved',
}
