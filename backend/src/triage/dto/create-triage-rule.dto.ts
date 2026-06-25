import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { IssuePriority } from '@prisma/client';

export class CreateTriageRuleDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  labelPattern?: string;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
