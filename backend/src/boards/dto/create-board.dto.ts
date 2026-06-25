import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
