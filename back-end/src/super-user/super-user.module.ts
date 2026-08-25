import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SuperUserService } from './super-user.service';
import { SuperUserController } from './super-user.controller';
import { SuperUserAuthMiddleware } from '../middlewares/router';

@Module({
  controllers: [SuperUserController],
  providers: [SuperUserService],
})
export class SuperUserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SuperUserAuthMiddleware)
      .forRoutes(SuperUserController);
  }
}

