export interface Department {
  id: string;
  stateId: string;
  name: string;
  code: string;
  description?: string;
  headUserId?: string; // Appointed Department Head
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface Designation {
  id: string;
  departmentId: string;
  title: string; // e.g. 'VRO', 'MRO', 'Tahsildar', 'Sanitary Inspector'
  code: string;
  description?: string;
  createdAt: string;
}

export interface OfficerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  departmentId: string;
  designationId: string;
  designationTitle: string;
  assignedNodeId: string; // Exact jurisdiction node mapped to this officer
  status: 'Active' | 'Suspended' | 'Inactive';
  createdAt: string;
}
