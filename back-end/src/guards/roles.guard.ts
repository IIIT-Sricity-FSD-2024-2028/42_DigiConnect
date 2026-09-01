import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, normalizeRole } from '../models/enums';
import { ROLES_KEY } from './roles.decorator';

export interface RequestUserContext {
  id: string;
  role: Role | null;
  rawRole?: string;
  stateId?: string;
  departmentId?: string;
  assignedNodeId?: string;
  designationId?: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const rawRole = (request.headers['x-role'] || request.headers['x-user-role']) as string;
    const normalizedRole = normalizeRole(rawRole);

    // Attach request user context
    request.user = {
      id: (request.headers['x-user-id'] as string) || 'anonymous',
      role: normalizedRole,
      rawRole: rawRole,
      stateId: request.headers['x-state-id'] as string,
      departmentId: request.headers['x-department-id'] as string,
      assignedNodeId: request.headers['x-assigned-node-id'] as string,
      designationId: request.headers['x-designation-id'] as string,
    } as RequestUserContext;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    if (!normalizedRole) {
      throw new ForbiddenException(`Missing or invalid x-role header: ${rawRole || 'none'}`);
    }

    // Check if normalizedRole matches any of the requiredRoles (also normalized)
    const hasRole = requiredRoles.some((reqRole) => {
      const normReq = normalizeRole(reqRole);
      return normReq === normalizedRole;
    });

    if (!hasRole) {
      throw new ForbiddenException(`Access denied for role: ${rawRole || normalizedRole}`);
    }

    return true;
  }
}
