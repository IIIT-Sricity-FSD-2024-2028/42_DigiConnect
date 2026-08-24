import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadTemplateDto {
  @ApiProperty({
    description: 'Type of uploaded document',
    enum: ['template', 'guideline'],
    default: 'template',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['template', 'guideline'])
  docType?: 'template' | 'guideline';

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The template or guideline file to upload (.pdf, .jpg, .png)',
    required: true,
  })
  @IsOptional()
  file?: any;
}
