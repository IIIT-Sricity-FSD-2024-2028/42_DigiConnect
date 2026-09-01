import { Module } from '@nestjs/common';
import { StateAdminService } from './state-admin.service';
import { StateAdminController } from './state-admin.controller';
import { CentralModule } from '../central/central.module';

@Module({
  imports: [CentralModule],
  controllers: [StateAdminController],
  providers: [StateAdminService],
  exports: [StateAdminService],
})
export class StateAdminModule {}
