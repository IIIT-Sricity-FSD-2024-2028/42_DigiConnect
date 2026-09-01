import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateGrievanceDto {
  @IsNotEmpty()
  @IsString()
  citizenId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['delay', 'rejection', 'payment', 'misconduct', 'technical', 'wrong-info', 'other'])
  category: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  relatedAppId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  evidence?: any;
}
