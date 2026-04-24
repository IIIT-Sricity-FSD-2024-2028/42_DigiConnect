import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { GrievancesModule } from './grievances/grievances.module';
import { ServicesModule } from './services/services.module';
import { WorkflowModule } from './workflow/workflow.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { SuperUserModule } from './super-user/super-user.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UsersModule,
    ApplicationsModule,
    GrievancesModule,
    ServicesModule,
    WorkflowModule,
    SupervisorModule,
    SuperUserModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
