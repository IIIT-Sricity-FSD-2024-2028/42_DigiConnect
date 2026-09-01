import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateNodeDto {
  @IsNotEmpty()
  @IsString()
  stateId: string;

  @IsOptional()
  parentId: string | null;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsIn(['RURAL', 'URBAN', 'COMMON'])
  governanceType: string;

  @IsNotEmpty()
  @IsIn([
    'STATE',
    'DISTRICT',
    'SUB_DIVISION',
    'MANDAL',
    'MUNICIPALITY',
    'VILLAGE',
    'GRAM_PANCHAYAT',
    'WARD',
    'ZONE',
  ])
  tierLevel: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsIn(['RURAL', 'URBAN', 'COMMON'])
  areaType?: string;
}

export class UpdateNodeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(['RURAL', 'URBAN', 'COMMON'])
  governanceType?: string;

  @IsOptional()
  @IsIn(['RURAL', 'URBAN', 'COMMON'])
  areaType?: string;

  @IsOptional()
  @IsIn([
    'STATE',
    'DISTRICT',
    'SUB_DIVISION',
    'MANDAL',
    'MUNICIPALITY',
    'VILLAGE',
    'GRAM_PANCHAYAT',
    'WARD',
    'ZONE',
  ])
  tierLevel?: string;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
