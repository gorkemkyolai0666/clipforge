import { IsEnum, IsOptional } from 'class-validator';
import { DependencyType } from '@prisma/client';

export class UpdateDependencyDto {
  @IsOptional()
  @IsEnum(DependencyType)
  type?: DependencyType;
}
