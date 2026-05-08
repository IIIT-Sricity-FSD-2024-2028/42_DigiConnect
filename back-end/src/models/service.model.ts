export interface GovtService {
  id: string; // 'SVC-XXX'
  name: string;
  cat: string; // Certificate, Welfare, Permission, Correction
  dept: string;
  sla: number; // days
  fee: number;
  feeLabel?: string;
  desc: string;
  docs: string[]; // required document names
  icon?: string;
  stages: number;
  status: 'Active' | 'Inactive' | 'Draft' | string;
  apps: number; // total applications count
  color?: string;
}
