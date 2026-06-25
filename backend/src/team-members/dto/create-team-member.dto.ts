import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateTeamMemberDto {
  @IsString()
  organizationId!: string;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsDateString()
  joinedAt?: string;
}
