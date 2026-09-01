import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CitizenContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const userId = req.headers['x-user-id'];
    if (!userId || (typeof userId === 'string' && userId.trim() === '')) {
      throw new UnauthorizedException('Citizen Context Required: Missing x-user-id header');
    }
    next();
  }
}
