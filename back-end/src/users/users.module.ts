import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SuperUserAuthMiddleware, CitizenContextMiddleware } from '../middlewares/router';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. SuperUser user management operations
    consumer
      .apply(SuperUserAuthMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/:id', method: RequestMethod.DELETE },
      );

    // 2. User identity context for password change
    consumer
      .apply(CitizenContextMiddleware)
      .forRoutes(
        { path: 'users/:id/password', method: RequestMethod.PATCH },
      );
  }
}

