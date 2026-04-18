import { Module } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService],
})
export class SupervisorModule {}
