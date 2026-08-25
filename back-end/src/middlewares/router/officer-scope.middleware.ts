import { Injectable, NestMiddleware, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OfficerScopeMiddleware implements NestMiddleware {
  private readonly allowedRoles = ['officer', 'supervisor', 'super_user', 'grievance'];

  use(req: Request, res: Response, next: NextFunction): void {
    const role = req.headers['x-role'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!role || !this.allowedRoles.includes(role)) {
      throw new ForbiddenException(
        `Staff Scope Required: Access restricted to authorized departmental personnel (Provided: ${role || 'none'})`,
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
