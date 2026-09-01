import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE';

export class ServiceFormFieldDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  type: FieldType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  constraints?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[]; // for DROPDOWN, RADIO, CHECKBOX
  };

  @IsOptional()
  @IsString()
  helpText?: string;
}

export class ServiceDocRequirementDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string; // e.g. 'Aadhaar Card'

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  allowedMimeTypes?: string[];

  @IsOptional()
  @IsNumber()
  maxSizeBytes?: number;
}

export class ServiceWorkflowStepDto {
  @IsNotEmpty()
  @IsNumber()
  stepNumber: number;

  @IsNotEmpty()
  @IsString()
  stepName: string; // e.g. 'VRO Verification'

  @IsNotEmpty()
  @IsString()
  requiredDesignationId: string; // e.g. 'desig_vro'

  @IsOptional()
  @IsBoolean()
  canApprove?: boolean;

  @IsOptional()
  @IsBoolean()
  canReject?: boolean;

  @IsOptional()
  @IsBoolean()
  canRaiseQuery?: boolean;

  @IsOptional()
  @IsBoolean()
  isFinalApprovalStep?: boolean;
}

export class CreateDynamicServiceDto {
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  stateId: string;

  @IsNotEmpty()
  @IsString()
  name: string; // e.g. 'Integrated Caste & Community Certificate'

  @IsNotEmpty()
  @IsString()
  code: string; // e.g. 'CASTE_CERT'

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  serviceFee?: number;

  @IsOptional()
  @IsNumber()
  platformFee?: number;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceFormFieldDto)
  fields: ServiceFormFieldDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceDocRequirementDto)
  documentRequirements: ServiceDocRequirementDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceWorkflowStepDto)
  workflowSteps: ServiceWorkflowStepDto[];
}
