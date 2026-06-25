import { IsInt, Min } from 'class-validator';

export class AddCreditsDto {
  @IsInt()
  @Min(1)
  amount!: number;
}
