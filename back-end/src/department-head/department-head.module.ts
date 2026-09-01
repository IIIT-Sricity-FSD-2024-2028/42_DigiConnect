import { Module } from '@nestjs/common';
import { DepartmentHeadService } from './department-head.service';
import { DepartmentHeadController } from './department-head.controller';

@Module({
  controllers: [DepartmentHeadController],
  providers: [DepartmentHeadService],
  exports: [DepartmentHeadService],
})
export class DepartmentHeadModule {}
