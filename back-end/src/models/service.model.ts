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
  templateDoc?: string; // Path to certificate template or scheme form
  guidelineDoc?: string; // Path to service guideline PDF
  attachments?: Array<{
    name: string;
    path: string;
    type: string;
    docType: string;
    uploadedAt: string;
  }>;
  code?: string;
  category?: string;
  serviceFee?: number;
  platformFee?: number;
  totalFee?: number;
  departmentId?: string;
  stateId?: string;
  fields?: any[];
  documentRequirements?: any[];
  workflowSteps?: any[];
}
