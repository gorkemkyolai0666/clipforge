import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CeremonyType } from '@prisma/client';

export class CreateCeremonyDto {
  @IsString()
  organizationId!: string;

  @IsOptional()
  @IsString()
  boardId?: string;

  @IsEnum(CeremonyType)
  type!: CeremonyType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
