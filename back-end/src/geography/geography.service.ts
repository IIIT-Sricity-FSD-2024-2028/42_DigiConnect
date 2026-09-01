import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { db } from '../data/store';
import {
  JurisdictionNode,
  JurisdictionTreeNode,
} from '../models/jurisdiction.model';
import { TierLevel } from '../models/enums';
import { CreateNodeDto, UpdateNodeDto } from './dto/create-node.dto';

@Injectable()
export class GeographyService {
  /**
   * Allowed parent -> child transitions in the authoritative DigiConnect hierarchy:
   * Rural: STATE -> DISTRICT -> SUB_DIVISION -> MANDAL -> VILLAGE / GRAM_PANCHAYAT
   * Urban: STATE -> DISTRICT -> SUB_DIVISION -> MUNICIPALITY -> WARD / ZONE
   */
  private validateHierarchy(
    parentTier: TierLevel | null,
    childTier: string,
    governanceType: string,
  ) {
    if (parentTier === null) {
      if (childTier !== 'STATE') {
        throw new BadRequestException(`Root node must have tierLevel 'STATE'.`);
      }
      return;
    }

    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      STATE: ['DISTRICT'],
      DISTRICT: ['SUB_DIVISION'],
      SUB_DIVISION: ['MANDAL', 'MUNICIPALITY'],
      MANDAL: ['VILLAGE', 'GRAM_PANCHAYAT'],
      MUNICIPALITY: ['WARD', 'ZONE'],
    };

    const allowed = ALLOWED_TRANSITIONS[parentTier] || [];
    if (!allowed.includes(childTier)) {
      throw new BadRequestException(
        `Invalid hierarchy: '${childTier}' cannot be a child of '${parentTier}'. Allowed child tiers under '${parentTier}' are: ${allowed.join(', ') || 'None (Leaf Node)'}.`,
      );
    }

    // Rural / Urban branch compatibility
    if (childTier === 'MANDAL' || childTier === 'VILLAGE' || childTier === 'GRAM_PANCHAYAT') {
      if (governanceType === 'URBAN') {
        throw new BadRequestException(`'${childTier}' is a Rural administrative tier and cannot be created under an Urban branch.`);
      }
    }

    if (childTier === 'MUNICIPALITY' || childTier === 'WARD' || childTier === 'ZONE') {
      if (governanceType === 'RURAL') {
        throw new BadRequestException(`'${childTier}' is an Urban administrative tier and cannot be created under a Rural branch.`);
      }
    }
  }

  /**
   * Get direct children of a parent node, optionally filtered by state.
   */
  getChildren(
    parentId: string | null = null,
    stateId?: string,
  ): JurisdictionNode[] {
    return db.jurisdictionNodes.filter((node) => {
      const matchState = !stateId || node.stateId === stateId;
      const matchParent = parentId === null ? node.parentId === null : node.parentId === parentId;
      return matchState && matchParent;
    });
  }

  /**
   * Fetch a specific node by ID.
   */
  getNodeById(id: string): JurisdictionNode {
    const node = db.jurisdictionNodes.find((n) => n.id === id);
    if (!node) {
      throw new NotFoundException(`Jurisdiction node '${id}' not found.`);
    }
    return node;
  }

  /**
   * Get all ancestor nodes of a node, ordered from immediate parent upwards to root.
   */
  getAncestors(nodeId: string): JurisdictionNode[] {
    const ancestors: JurisdictionNode[] = [];
    let current = db.jurisdictionNodes.find((n) => n.id === nodeId);
    if (!current) return [];

    const visited = new Set<string>([current.id]);
    while (current && current.parentId) {
      if (visited.has(current.parentId)) {
        break; // Cycle prevention
      }
      const parent = db.jurisdictionNodes.find((n) => n.id === current!.parentId);
      if (!parent) break;
      ancestors.push(parent);
      visited.add(parent.id);
      current = parent;
    }
    return ancestors;
  }

  /**
   * Get all descendant node IDs recursively.
   */
  getDescendantNodeIds(nodeId: string): string[] {
    const ids: string[] = [nodeId];
    const directChildren = db.jurisdictionNodes.filter((n) => n.parentId === nodeId);
    for (const child of directChildren) {
      ids.push(...this.getDescendantNodeIds(child.id));
    }
    return ids;
  }

  /**
   * Traverse up the tree to find an ancestor with a specific tier level.
   */
  findParentNodeByLevel(
    startNodeId: string,
    targetTier: TierLevel,
  ): JurisdictionNode | null {
    const node = db.jurisdictionNodes.find((n) => n.id === startNodeId);
    if (!node) return null;
    if (node.tierLevel === targetTier) return node;

    const ancestors = this.getAncestors(startNodeId);
    return ancestors.find((a) => a.tierLevel === targetTier) || null;
  }

  /**
   * Master Scoping Logic: Determines if a citizen's leaf node falls under an officer's assigned node.
   */
  isNodeWithinScope(leafNodeId: string, assignedNodeId: string): boolean {
    if (!leafNodeId || !assignedNodeId) return false;
    if (leafNodeId === assignedNodeId) return true;

    const ancestors = this.getAncestors(leafNodeId);
    return ancestors.some((a) => a.id === assignedNodeId);
  }

  /**
   * Build recursive tree of jurisdiction nodes for visual display.
   */
  buildTree(stateId?: string): JurisdictionTreeNode[] {
    const rootNodes = db.jurisdictionNodes.filter((node) => {
      const isRoot = node.parentId === null;
      return isRoot && (!stateId || node.stateId === stateId);
    });

    const populateChildren = (node: JurisdictionNode): JurisdictionTreeNode => {
      const children = db.jurisdictionNodes.filter(
        (child) => child.parentId === node.id,
      );
      return {
        ...node,
        status: node.status || 'Active',
        areaType: node.areaType || node.governanceType,
        children: children.map((c) => populateChildren(c)),
      };
    };

    return rootNodes.map((root) => populateChildren(root));
  }

  /**
   * Deep Node Inspection & Dependency Analysis
   */
  getNodeDetails(id: string) {
    const node = this.getNodeById(id);
    const ancestors = this.getAncestors(id);
    const breadcrumb = [...ancestors]
      .reverse()
      .map((a) => a.name)
      .concat(node.name)
      .join(' › ');

    const directChildren = db.jurisdictionNodes.filter((n) => n.parentId === id);
    const descendantIds = this.getDescendantNodeIds(id);

    // Mapped officers
    const directOfficers = db.officers.filter((o) => o.assignedNodeId === id);
    const allOfficers = db.officers.filter((o) => descendantIds.includes(o.assignedNodeId));

    // Mapped applications
    const mappedApplications = db.applications.filter((a) => {
      const leaf = a.jurisdiction || (a as any).selectedJurisdictionNodeId;
      return descendantIds.includes(leaf);
    });

    // Mapped grievances
    const mappedGrievances = db.grievances.filter((g) => {
      return (
        descendantIds.includes(g.jurisdiction) ||
        ((g as any).assignedNodeId && descendantIds.includes((g as any).assignedNodeId))
      );
    });

    const hasOperationalRecords =
      allOfficers.length > 0 || mappedApplications.length > 0 || mappedGrievances.length > 0;

    const canDelete = node.tierLevel !== 'STATE' && !hasOperationalRecords;

    let deleteBlockReason = '';
    if (node.tierLevel === 'STATE') {
      deleteBlockReason = 'The State root jurisdiction cannot be deleted.';
    } else if (allOfficers.length > 0) {
      deleteBlockReason = `Referenced by ${allOfficers.length} officer(s). Deactivate this jurisdiction instead to maintain administrative history.`;
    } else if (mappedApplications.length > 0) {
      deleteBlockReason = `Referenced by ${mappedApplications.length} application(s). Deactivate this jurisdiction instead to preserve historical records.`;
    } else if (mappedGrievances.length > 0) {
      deleteBlockReason = `Referenced by ${mappedGrievances.length} grievance(s). Deactivate this jurisdiction instead.`;
    }

    return {
      ...node,
      status: node.status || 'Active',
      areaType: node.areaType || node.governanceType,
      ancestors,
      breadcrumb,
      childrenCount: directChildren.length,
      descendantsCount: descendantIds.length - 1,
      dependencies: {
        officersCount: allOfficers.length,
        applicationsCount: mappedApplications.length,
        grievancesCount: mappedGrievances.length,
        directOfficers: directOfficers.map((o) => ({
          id: o.id,
          name: o.name,
          role: (o as any).designationTitle || (o as any).role || 'Officer',
          status: o.status || 'Active',
        })),
      },
      canDelete,
      deleteBlockReason,
    };
  }

  /**
   * Safe delete jurisdiction node. Protected against deleting referenced records.
   */
  deleteNode(id: string, cascade: boolean = false): { success: boolean; message: string } {
    const details = this.getNodeDetails(id);

    if (details.tierLevel === 'STATE') {
      throw new BadRequestException('The State root jurisdiction cannot be deleted.');
    }

    if (details.dependencies.officersCount > 0) {
      throw new BadRequestException(
        `Cannot delete jurisdiction '${details.name}' because ${details.dependencies.officersCount} officer(s) are assigned to it. Deactivate this jurisdiction instead.`,
      );
    }
    if (details.dependencies.applicationsCount > 0) {
      throw new BadRequestException(
        `Cannot delete jurisdiction '${details.name}' because ${details.dependencies.applicationsCount} application(s) reference it. Deactivate this jurisdiction instead to preserve historical audit integrity.`,
      );
    }
    if (details.dependencies.grievancesCount > 0) {
      throw new BadRequestException(
        `Cannot delete jurisdiction '${details.name}' because ${details.dependencies.grievancesCount} grievance(s) reference it. Deactivate this jurisdiction instead.`,
      );
    }

    if (details.childrenCount > 0 && !cascade) {
      throw new BadRequestException(
        `Cannot delete jurisdiction '${details.name}' because it contains ${details.childrenCount} child jurisdiction(s). Delete child units first, or confirm deleting all child units.`,
      );
    }

    const descendantIds = this.getDescendantNodeIds(id);
    const idsToDelete = cascade ? descendantIds : [id];
    let deletedCount = 0;
    for (const delId of idsToDelete) {
      const index = db.jurisdictionNodes.findIndex((n) => n.id === delId);
      if (index >= 0) {
        db.jurisdictionNodes.splice(index, 1);
        deletedCount++;
      }
    }

    db.auditLogs.unshift({
      id: `AUD-JUR-${Date.now()}`,
      action: 'JURISDICTION_DELETED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Deleted jurisdiction node '${details.name}' (${details.tierLevel}, ID: ${id})${cascade && deletedCount > 1 ? ` and ${deletedCount - 1} child unit(s)` : ''}.`,
    });

    return {
      success: true,
      message: `Jurisdiction '${details.name}' (${id}) deleted successfully.`,
    };
  }

  /**
   * Aggregated Tier Summary Statistics for a State
   */
  getStateStats(stateId: string) {
    const nodes = db.jurisdictionNodes.filter((n) => n.stateId === stateId);
    const districts = nodes.filter((n) => n.tierLevel === 'DISTRICT');
    const subDivisions = nodes.filter((n) => n.tierLevel === 'SUB_DIVISION');
    const mandals = nodes.filter((n) => n.tierLevel === 'MANDAL');
    const villages = nodes.filter(
      (n) => n.tierLevel === 'VILLAGE' || (n.tierLevel as string) === 'GRAM_PANCHAYAT',
    );
    const municipalities = nodes.filter((n) => n.tierLevel === 'MUNICIPALITY');
    const wards = nodes.filter(
      (n) => n.tierLevel === 'WARD' || (n.tierLevel as string) === 'ZONE',
    );

    const activeNodes = nodes.filter((n) => n.status !== 'Inactive');
    const inactiveNodes = nodes.filter((n) => n.status === 'Inactive');

    return {
      stateId,
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      inactiveNodes: inactiveNodes.length,
      districtsCount: districts.length,
      subDivisionsCount: subDivisions.length,
      mandalsCount: mandals.length,
      villagesCount: villages.length,
      municipalitiesCount: municipalities.length,
      wardsCount: wards.length,
    };
  }

  /**
   * Create a new dynamic jurisdiction node with strict hierarchy and duplicate checking.
   */
  createNode(dto: CreateNodeDto): JurisdictionNode {
    // Check state existence
    const state = db.states.find((s) => s.id === dto.stateId);
    if (!state) {
      throw new NotFoundException(`State '${dto.stateId}' does not exist.`);
    }

    let parentNode: JurisdictionNode | null = null;
    if (dto.parentId) {
      parentNode = db.jurisdictionNodes.find((n) => n.id === dto.parentId) || null;
      if (!parentNode) {
        throw new NotFoundException(`Parent node '${dto.parentId}' does not exist.`);
      }
      if (parentNode.stateId !== dto.stateId) {
        throw new BadRequestException(
          `Parent node '${dto.parentId}' belongs to state '${parentNode.stateId}', not '${dto.stateId}'.`,
        );
      }
    }

    // Validate hierarchy transitions
    this.validateHierarchy(
      parentNode ? parentNode.tierLevel : null,
      dto.tierLevel,
      dto.governanceType,
    );

    // Duplicate check under same parent
    const duplicate = db.jurisdictionNodes.find(
      (n) =>
        n.stateId === dto.stateId &&
        n.parentId === (dto.parentId || null) &&
        n.name.toLowerCase() === dto.name.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new ConflictException(
        `A jurisdiction named '${dto.name}' already exists under '${parentNode ? parentNode.name : 'State Root'}'.`,
      );
    }

    const newNode: JurisdictionNode = {
      id: `node_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substr(2, 4)}`,
      stateId: dto.stateId,
      parentId: dto.parentId || null,
      name: dto.name.trim(),
      governanceType: dto.governanceType as any,
      tierLevel: dto.tierLevel as any,
      code: dto.code ? dto.code.trim().toUpperCase() : dto.name.toUpperCase().replace(/\s+/g, '_').slice(0, 10),
      status: dto.status || 'Active',
      areaType: (dto.areaType || dto.governanceType) as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.jurisdictionNodes.push(newNode);

    // Log Secretariat Audit Event
    db.auditLogs.unshift({
      id: `AUD-JUR-${Date.now()}`,
      action: 'JURISDICTION_CREATED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Created new jurisdiction '${newNode.name}' (${newNode.tierLevel}, ${newNode.governanceType}) under '${parentNode ? parentNode.name : 'Root'}'.`,
    });

    return newNode;
  }

  /**
   * Update jurisdiction node properties (renaming keeps stable ID).
   */
  updateNode(id: string, dto: UpdateNodeDto): JurisdictionNode {
    const node = this.getNodeById(id);

    if (dto.name && dto.name.trim() !== node.name) {
      // Check duplicate
      const duplicate = db.jurisdictionNodes.find(
        (n) =>
          n.id !== id &&
          n.parentId === node.parentId &&
          n.name.toLowerCase() === dto.name!.trim().toLowerCase(),
      );
      if (duplicate) {
        throw new ConflictException(
          `Another jurisdiction named '${dto.name}' already exists under the same parent.`,
        );
      }
      const prevName = node.name;
      node.name = dto.name.trim();

      // Audit rename
      db.auditLogs.unshift({
        id: `AUD-JUR-${Date.now()}`,
        action: 'JURISDICTION_RENAMED',
        actor: 'State Admin',
        role: 'STATE_ADMIN',
        date: new Date().toISOString(),
        details: `Renamed jurisdiction from '${prevName}' to '${node.name}' (ID: ${node.id} preserved).`,
      });
    }

    if (dto.code) node.code = dto.code.trim().toUpperCase();
    if (dto.governanceType) node.governanceType = dto.governanceType as any;
    if (dto.areaType) node.areaType = dto.areaType as any;
    if (dto.status) node.status = dto.status;
    node.updatedAt = new Date().toISOString();

    return node;
  }

  /**
   * Toggle Active / Inactive status of a jurisdiction node without destroying historical links.
   */
  toggleStatus(id: string, status: 'Active' | 'Inactive'): JurisdictionNode {
    const node = this.getNodeById(id);
    if (node.tierLevel === 'STATE') {
      throw new BadRequestException('The State root jurisdiction cannot be deactivated.');
    }

    node.status = status;
    node.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `AUD-JUR-${Date.now()}`,
      action: status === 'Active' ? 'JURISDICTION_ACTIVATED' : 'JURISDICTION_DEACTIVATED',
      actor: 'State Admin',
      role: 'STATE_ADMIN',
      date: new Date().toISOString(),
      details: `Jurisdiction '${node.name}' (${node.tierLevel}) marked as ${status}.`,
    });

    return node;
  }



  /**
   * Fetch recent jurisdiction audit activities
   */
  getAuditLogs(stateId?: string) {
    return db.auditLogs
      .filter((l) => l.action?.includes('JURISDICTION') || l.details?.includes('jurisdiction') || l.details?.includes('Jurisdiction'))
      .slice(0, 15);
  }
}
