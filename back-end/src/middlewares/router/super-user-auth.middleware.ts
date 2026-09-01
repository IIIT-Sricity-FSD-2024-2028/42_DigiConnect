import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Role, normalizeRole } from '../../models/enums';

@Injectable()
export class SuperUserAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const roleHeader = req.headers['x-role'] as string;
    const normalized = normalizeRole(roleHeader);
    if (normalized !== Role.CENTRAL_ADMIN) {
      throw new ForbiddenException('Super User Privilege Required: Access restricted to System Administrators');
    }
    next();
  }
}

