import { IsOptional, IsString } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}
