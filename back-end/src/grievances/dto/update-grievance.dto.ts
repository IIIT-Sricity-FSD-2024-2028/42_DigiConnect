import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { GrievanceStatus } from '../../models/enums';

export function normalizeGrievanceStatus(val: any): any {
  if (typeof val !== 'string') return val;
  const s = val.trim();
  const lower = s.toLowerCase().replace(/_/g, '-');
  if (lower === 'submitted') return GrievanceStatus.SUBMITTED;
  if (lower === 'open') return GrievanceStatus.OPEN;
  if (lower === 'under-review') return GrievanceStatus.UNDER_REVIEW;
  if (lower === 'investigating' || lower === 'under-investigation') return GrievanceStatus.INVESTIGATING;
  if (lower === 'escalated') return GrievanceStatus.ESCALATED;
  if (lower === 'resolved') return GrievanceStatus.RESOLVED;
  if (lower === 'rejected') return GrievanceStatus.REJECTED;
  if (lower === 'dismissed') return GrievanceStatus.DISMISSED;
  if (lower === 'escalated-resolved') return GrievanceStatus.ESCALATED_RESOLVED;
  return s;
}

export class UpdateGrievanceDto {
  @IsOptional()
  @Transform(({ value }) => normalizeGrievanceStatus(value))
  @IsEnum(GrievanceStatus)
  status?: GrievanceStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  resolutionNote?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

