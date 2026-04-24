import { AppStatus } from './enums';

export interface Document {
  name: string;
  type: string;
  date: string;
  status: string;
  size?: string;
  icon?: string;
}

export interface TimelineEntry {
  action: string;
  date: string;
  actor: string;
  note: string;
}

export interface Application {
  id: string; // 'APP-XXXX'
  serviceId: string;
  serviceName: string;
  serviceType: string; // certificate, welfare, permission
  citizenId: string;
  citizenName: string;
  jurisdiction: string;
  parentAppId?: string;
  officerId: string;
  officerName: string;
  dept: string;
  status: AppStatus | string;
  remarks: string;
  fee: number;
  paymentMethod?: string;
  paymentStatus: string;
  submittedDate: string;
  slaDate: string;
  timeline: TimelineEntry[];
  documents: Document[];
  citizenResponse?: string;
}
