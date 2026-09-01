import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  stateId: string;

  @IsNotEmpty()
  @IsString()
  name: string; // e.g. 'Transport Department'

  @IsNotEmpty()
  @IsString()
  code: string; // e.g. 'TRANS-AP'

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  headUserName?: string; // e.g. 'Srikanth Verma'

  @IsOptional()
  @IsString()
  headUserEmail?: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  headUserId?: string;

  @IsOptional()
  @IsString()
  headUserName?: string;

  @IsOptional()
  @IsString()
  headUserEmail?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | string;
}

export class AssignHeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}

