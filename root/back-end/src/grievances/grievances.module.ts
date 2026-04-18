import { Module } from '@nestjs/common';
import { GrievancesService } from './grievances.service';
import { GrievancesController } from './grievances.controller';

@Module({
  controllers: [GrievancesController],
  providers: [GrievancesService],
})
export class GrievancesModule {}
