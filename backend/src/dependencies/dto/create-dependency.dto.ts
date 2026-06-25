import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DependencyType } from '@prisma/client';

export class CreateDependencyDto {
  @IsString()
  issueId!: string;

  @IsString()
  dependsOnIssueId!: string;

  @IsEnum(DependencyType)
  type!: DependencyType;
}

export class CreateSprintIssueDto {
  @IsString()
  sprintId!: string;

  @IsString()
  issueId!: string;

  @IsOptional()
  @IsDateString()
  addedAt?: string;
}

export class UpdateSprintIssueDto {
  @IsOptional()
  @IsDateString()
  addedAt?: string;
}
