import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  boardId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  wipLimit?: number;
}
