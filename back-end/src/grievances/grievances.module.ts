import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { GrievancesService } from './grievances.service';
import { GrievancesController } from './grievances.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CitizenContextMiddleware, OfficerScopeMiddleware } from '../middlewares/router';

@Module({
  imports: [UsersModule, NotificationsModule, CertificatesModule],
  controllers: [GrievancesController],
  providers: [GrievancesService],
})
export class GrievancesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Citizen-specific sub-routes
    consumer
      .apply(CitizenContextMiddleware)
      .forRoutes(
        { path: 'grievances/my', method: RequestMethod.GET },
      );

    // 2. Grievance Officer / Supervisor sub-routes
    consumer
      .apply(OfficerScopeMiddleware)
      .forRoutes(
        { path: 'grievances/:id/status', method: RequestMethod.PATCH },
      );
  }
}

