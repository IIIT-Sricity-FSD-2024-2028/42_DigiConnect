import { GrievanceStatus } from './enums';

export interface HistoryEntry {
  action: string;
  date: string;
  actor: string;
  note: string;
}

export interface Grievance {
  id: string; // 'GRV-XXX'
  citizenId: string;
  citizenName: string;
  jurisdiction: string;
  officerId: string;
  officerName: string;
  category: 'delay' | 'rejection' | 'payment' | 'misconduct' | string;
  subject: string;
  description: string;
  relatedAppId: string;
  status: GrievanceStatus | string;
  priority: 'low' | 'medium' | 'high' | string;
  slaStatus: 'safe' | 'warn' | 'breach' | string;
  filedDate: string;
  lastUpdated: string;
  closedDate?: string;
  daysTaken?: number;
  resolvedBy?: string;
  resolutionNote?: string;
  history: HistoryEntry[];
}
