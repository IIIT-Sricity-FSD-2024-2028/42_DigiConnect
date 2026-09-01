export interface StateGovernment {
  id: string; // e.g. 'state_ap', 'state_ts'
  name: string; // e.g. 'Andhra Pradesh'
  code: string; // e.g. 'AP'
  rootNodeId: string; // Root jurisdiction node ID
  stateAdminId?: string; // One State Admin only
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}
