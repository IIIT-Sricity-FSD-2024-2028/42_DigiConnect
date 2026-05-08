import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GrievanceStatus } from '../../models/enums';

export class UpdateGrievanceDto {
  @IsEnum(GrievanceStatus)
  status: GrievanceStatus;

  @IsOptional()
  @IsString()
  resolutionNote?: string;
}
