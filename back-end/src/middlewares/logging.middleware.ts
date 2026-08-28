import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { appLogger } from '../utils/winston-logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'Unknown';
    const userId = (req.headers['x-user-id'] as string) || 'Anonymous';
    const role = (req.headers['x-role'] as string) || 'Guest';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;

      // Skip 304 Not Modified responses to prevent infinite file-watcher loops with Live Server
      // if (statusCode === 304) {
      //   return;
      // }

      const duration = Date.now() - startTime;
      const logMessage = `HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms [User: ${userId}, Role: ${role}]`;

      const meta = {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        ip: ip || req.socket.remoteAddress,
        userAgent,
        userId,
        role,
      };

      if (statusCode >= 500) {
        appLogger.error(logMessage, meta);
      } else if (statusCode >= 400) {
        appLogger.warn(logMessage, meta);
      } else {
        appLogger.info(logMessage, meta);
      }
    });

    next();
  }
}
