import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDesignationDto {
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  title: string; // e.g. 'VRO', 'MRO', 'Tahsildar'

  @IsNotEmpty()
  @IsString()
  code: string; // e.g. 'VRO', 'MRO'

  @IsOptional()
  @IsString()
  description?: string;
}

export class OnboardOfficerDto {
  @IsNotEmpty()
  @IsString()
  name: string; // e.g. 'Gokul Rao'

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  designationId: string;

  @IsNotEmpty()
  @IsString()
  assignedNodeId: string; // Must exist in jurisdiction_nodes
}

export class UpdateOfficerStatusDto {
  @IsNotEmpty()
  @IsString()
  status: 'Active' | 'Suspended' | 'Inactive';
}
