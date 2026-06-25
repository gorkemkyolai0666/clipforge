import { IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  action!: string;

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}
