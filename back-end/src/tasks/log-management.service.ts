import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { appLogger } from '../utils/winston-logger';

@Injectable()
export class LogManagementService {
  private readonly logger = new Logger(LogManagementService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs');

  /**
   * Periodic Log File Health & Rotation Maintenance
   * Runs at regular intervals (every hour) to verify log directory integrity,
   * calculate total log file sizes, and record audit metrics.
   */
  @Cron(CronExpression.EVERY_HOUR)
  handlePeriodicLogCheck(): void {
    try {
      if (fs.existsSync(this.logsDir)) {
        const files = fs.readdirSync(this.logsDir);
        let totalSizeBytes = 0;

        files.forEach((file) => {
          const filePath = path.join(this.logsDir, file);
          const stats = fs.statSync(filePath);
          totalSizeBytes += stats.size;
        });

        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        appLogger.info(
          `[Log Management] Hourly Check: ${files.length} active log files managed, Total size: ${totalSizeMB} MB`,
          { fileCount: files.length, totalSizeMB }
        );
      }
    } catch (err: any) {
      appLogger.error('[Log Management] Failed to execute periodic log check', {
        error: err.message,
      });
    }
  }
}
