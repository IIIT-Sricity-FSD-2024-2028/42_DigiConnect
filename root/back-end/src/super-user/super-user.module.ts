import { Module } from '@nestjs/common';
import { SuperUserService } from './super-user.service';
import { SuperUserController } from './super-user.controller';

@Module({
  controllers: [SuperUserController],
  providers: [SuperUserService],
})
export class SuperUserModule {}
