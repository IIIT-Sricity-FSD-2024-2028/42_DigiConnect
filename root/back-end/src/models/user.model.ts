import { Role } from './enums';

export interface User {
  id: string; // e.g. 'CIT-001', 'EMP-001'
  name: string;
  email: string;
  phone: string;
  aadhaar: string; // raw 12-digit
  role: Role;
  title?: string; // VRO, RI, MRO etc.
  dept?: string;
  jurisdiction?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  services?: string[]; // services officer handles
  joinedDate: string;
}
