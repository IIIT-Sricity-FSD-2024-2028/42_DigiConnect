import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNotEmpty()
  @IsString()
  citizenId: string;

  @IsNotEmpty()
  @IsString()
  dept: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  documents?: any[]; // Allow generic documents object array

  @IsOptional()
  document?: any; // Single uploaded document field

  @IsOptional()
  formData?: any; // Allow dynamic form data
}
