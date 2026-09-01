import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Role } from '../../models/enums';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  aadhaar: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  dept?: string;

  @ValidateIf(o => o.role === Role.CITIZEN)
  @IsNotEmpty({ message: 'Jurisdiction is required for citizens.' })
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  otp?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
