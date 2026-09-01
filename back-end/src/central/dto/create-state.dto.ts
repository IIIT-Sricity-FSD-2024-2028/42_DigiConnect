import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStateDto {
  @IsNotEmpty()
  @IsString()
  name: string; // e.g. 'Tamil Nadu'

  @IsNotEmpty()
  @IsString()
  code: string; // e.g. 'TN'

  @IsOptional()
  @IsString()
  stateAdminName?: string; // e.g. 'R. K. Verma'

  @IsOptional()
  @IsString()
  stateAdminEmail?: string;
}
