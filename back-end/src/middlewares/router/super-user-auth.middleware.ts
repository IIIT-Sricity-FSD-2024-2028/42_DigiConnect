import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SuperUserAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const role = req.headers['x-role'];
    if (role !== 'super_user') {
      throw new ForbiddenException('Super User Privilege Required: Access restricted to System Administrators');
    }
    next();
  }
}
