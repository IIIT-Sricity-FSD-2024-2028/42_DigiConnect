import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GeographyModule } from '../geography/geography.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CitizenContextMiddleware, OfficerScopeMiddleware } from '../middlewares/router';

@Module({
  imports: [UsersModule, NotificationsModule, GeographyModule, CertificatesModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Citizen-specific sub-routes requiring x-user-id
    consumer
      .apply(CitizenContextMiddleware)
      .forRoutes(
        { path: 'applications/my', method: RequestMethod.GET },
        { path: 'applications/:id/query-response', method: RequestMethod.PATCH },
      );

    // 2. Officer-specific sub-routes requiring staff privilege & audit tracking
    consumer
      .apply(OfficerScopeMiddleware)
      .forRoutes(
        { path: 'applications/officer-queue', method: RequestMethod.GET },
        { path: 'applications/officer-queries', method: RequestMethod.GET },
        { path: 'applications/officer-activity', method: RequestMethod.GET },
        { path: 'applications/officer-sla-risks', method: RequestMethod.GET },
        { path: 'applications/officer-week-chart', method: RequestMethod.GET },
        { path: 'applications/:id/status', method: RequestMethod.PATCH },
        { path: 'applications/:id/request-verification', method: RequestMethod.POST },
        { path: 'applications/:id/resolve-verification', method: RequestMethod.POST },
      );
  }
}

