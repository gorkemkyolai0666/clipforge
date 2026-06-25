import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(OmitType(CreateIssueDto, ['boardId'] as const)) {}
