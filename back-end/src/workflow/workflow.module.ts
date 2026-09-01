import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SuperUserAuthMiddleware, OfficerScopeMiddleware } from '../middlewares/router';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. SuperUser administrative configuration & audit
    consumer
      .apply(SuperUserAuthMiddleware)
      .forRoutes(
        { path: 'workflow/config', method: RequestMethod.GET },
        { path: 'workflow/config', method: RequestMethod.PATCH },
        { path: 'workflow/audit-logs', method: RequestMethod.GET },
      );

    // 2. Officer workflow state transition
    consumer
      .apply(OfficerScopeMiddleware)
      .forRoutes(
        { path: 'workflow/transition', method: RequestMethod.POST },
      );
  }
}

