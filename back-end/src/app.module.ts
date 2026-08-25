import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { GrievancesModule } from './grievances/grievances.module';
import { ServicesModule } from './services/services.module';
import { WorkflowModule } from './workflow/workflow.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { SuperUserModule } from './super-user/super-user.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { SanitizationMiddleware } from './middlewares/sanitization.middleware';
import { LogManagementService } from './tasks/log-management.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]), // 100 requests per minute globally
    UsersModule,
    ApplicationsModule,
    GrievancesModule,
    ServicesModule,
    WorkflowModule,
    SupervisorModule,
    SuperUserModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LogManagementService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Sanitization and Logging middlewares across all routes
    consumer.apply(SanitizationMiddleware, LoggingMiddleware).forRoutes('*');
  }
}

