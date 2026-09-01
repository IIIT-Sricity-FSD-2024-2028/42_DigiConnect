import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppStatus } from '../../models/enums';

export class TransitionDto {
  @IsNotEmpty()
  @IsString()
  appId: string;

  @IsEnum(AppStatus)
  newStatus: AppStatus;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  actorName?: string;
}
