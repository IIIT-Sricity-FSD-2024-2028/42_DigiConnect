import { Injectable, NestMiddleware, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Role, normalizeRole } from '../../models/enums';

@Injectable()
export class OfficerScopeMiddleware implements NestMiddleware {
  private readonly staffRoles: Role[] = [
    Role.OFFICER,
    Role.DEPARTMENT_HEAD,
    Role.GRIEVANCE_OFFICER,
    Role.STATE_ADMIN,
    Role.CENTRAL_ADMIN,
  ];

  use(req: Request, res: Response, next: NextFunction): void {
    const roleHeader = req.headers['x-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    const normalized = normalizeRole(roleHeader);

    if (!normalized || !this.staffRoles.includes(normalized)) {
      throw new ForbiddenException(
        `Staff Scope Required: Access restricted to authorized departmental personnel (Provided: ${roleHeader || 'none'})`,
      );
    }

    // For state-mutating requests (POST, PATCH, PUT, DELETE), enforce presence of x-user-id for audit trail
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      if (!userId || userId.trim() === '') {
        throw new UnauthorizedException(
          'Staff Context Required: Missing x-user-id header for audit-tracked state change',
        );
      }
    }

    next();
  }
}
