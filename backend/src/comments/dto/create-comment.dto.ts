import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  issueId!: string;

  @IsString()
  authorId!: string;

  @IsString()
  body!: string;
}
