import { GovernanceType, TierLevel } from './enums';

export interface JurisdictionNode {
  id: string;
  stateId: string;
  parentId: string | null; // Root node (STATE) has parentId = null
  name: string;
  governanceType: GovernanceType;
  tierLevel: TierLevel;
  code?: string;
  status?: 'Active' | 'Inactive';
  areaType?: 'RURAL' | 'URBAN' | 'COMMON';
  createdAt?: string;
  updatedAt?: string;
}

export interface JurisdictionTreeNode extends JurisdictionNode {
  children: JurisdictionTreeNode[];
}
