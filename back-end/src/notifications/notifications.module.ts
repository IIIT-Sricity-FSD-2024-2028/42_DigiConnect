import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { CitizenContextMiddleware } from '../middlewares/router';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CitizenContextMiddleware)
      .forRoutes(
        { path: 'notifications', method: RequestMethod.GET },
        { path: 'notifications/count', method: RequestMethod.GET },
        { path: 'notifications/read-all', method: RequestMethod.PATCH },
        { path: 'notifications/:id/read', method: RequestMethod.PATCH },
      );
  }
}

