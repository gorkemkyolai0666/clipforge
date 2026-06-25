import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(OmitType(CreateBoardDto, ['organizationId'] as const)) {}
