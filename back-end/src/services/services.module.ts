import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { SuperUserAuthMiddleware } from '../middlewares/router';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SuperUserAuthMiddleware)
      .forRoutes(
        { path: 'services/all', method: RequestMethod.GET },
        { path: 'services', method: RequestMethod.POST },
        { path: 'services/:id/upload-template', method: RequestMethod.POST },
        { path: 'services/:id', method: RequestMethod.PATCH },
        { path: 'services/:id/toggle', method: RequestMethod.PATCH },
      );
  }
}

