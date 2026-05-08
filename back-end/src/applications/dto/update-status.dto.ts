import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppStatus } from '../../models/enums';

export class UpdateStatusDto {
  @IsEnum(AppStatus)
  status: AppStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
