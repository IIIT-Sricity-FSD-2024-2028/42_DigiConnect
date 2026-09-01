import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TierLevel } from '../../models/enums';

export class GrievanceWorkflowStepDto {
  @IsNotEmpty()
  stepNumber: number;

  @IsNotEmpty()
  @IsString()
  roleTitle: string; // e.g. 'Sub-Division Grievance Officer', 'District Grievance Officer', 'State Grievance Officer'

  @IsNotEmpty()
  @IsString()
  jurisdictionTier: string; // 'SUB_DIVISION' | 'DISTRICT' | 'STATE'

  @IsOptional()
  @IsString()
  assignedOfficerId?: string;
}

export class ConfigureGrievanceCellDto {
  @IsNotEmpty()
  @IsString()
  stateId: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  cellName: string; // e.g. 'Revenue Redressal Cell'

  @IsOptional()
  @IsString()
  jurisdictionTier?: string; // 'SUB_DIVISION' | 'DISTRICT' | 'STATE'

  @IsOptional()
  slaDays?: number;

  @IsOptional()
  @IsString()
  deptName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrievanceWorkflowStepDto)
  workflowSteps?: GrievanceWorkflowStepDto[];
}
