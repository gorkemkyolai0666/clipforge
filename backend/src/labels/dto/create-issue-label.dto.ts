import { IsOptional, IsString } from 'class-validator';

export class CreateIssueLabelDto {
  @IsString()
  issueId!: string;

  @IsString()
  labelId!: string;
}

export class UpdateIssueLabelDto {
  @IsOptional()
  @IsString()
  labelId?: string;
}
