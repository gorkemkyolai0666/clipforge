import {
  IsDateString, IsEnum, IsInt, IsOptional, IsString, Min,
} from 'class-validator';
import { IssuePriority, IssueStatus } from '@prisma/client';

export class CreateIssueDto {
  @IsString()
  boardId!: string;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  reporterId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
