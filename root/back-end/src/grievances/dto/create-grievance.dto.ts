import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateGrievanceDto {
  @IsNotEmpty()
  @IsString()
  citizenId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['delay', 'rejection', 'payment', 'misconduct'])
  category: 'delay' | 'rejection' | 'payment' | 'misconduct';

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  relatedAppId: string;
}
