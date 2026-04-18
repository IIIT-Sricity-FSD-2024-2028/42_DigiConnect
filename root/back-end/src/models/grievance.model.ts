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
  officerId: string;
  officerName: string;
  category: 'delay' | 'rejection' | 'payment' | 'misconduct';
  subject: string;
  description: string;
  relatedAppId: string;
  status: GrievanceStatus;
  priority: 'low' | 'medium' | 'high';
  slaStatus: 'safe' | 'warn' | 'breach';
  filedDate: string;
  lastUpdated: string;
  history: HistoryEntry[];
}
