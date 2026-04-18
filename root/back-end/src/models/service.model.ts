export interface GovtService {
  id: string; // 'SVC-XXX'
  name: string;
  cat: string; // Certificate, Welfare, Permission, Correction
  dept: string;
  sla: number; // days
  fee: number;
  desc: string;
  docs: string[]; // required document names
  stages: number;
  status: 'Active' | 'Inactive' | 'Draft';
  apps: number; // total applications count
}
