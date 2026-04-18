import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cat: string;

  @IsNotEmpty()
  @IsString()
  dept: string;

  @IsNotEmpty()
  @IsNumber()
  sla: number;

  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsArray()
  @IsString({ each: true })
  docs: string[];

  @IsNotEmpty()
  @IsNumber()
  stages: number;

  @IsOptional()
  @IsString()
  status?: 'Active' | 'Inactive' | 'Draft';
}
