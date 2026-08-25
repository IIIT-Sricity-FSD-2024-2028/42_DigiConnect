import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OfficerScopeMiddleware } from '../middlewares/router';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [SupervisorController],
  providers: [SupervisorService],
})
export class SupervisorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OfficerScopeMiddleware)
      .forRoutes(SupervisorController);
  }
}

