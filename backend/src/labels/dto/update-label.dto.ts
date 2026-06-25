import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateLabelDto } from './create-label.dto';

export class UpdateLabelDto extends PartialType(OmitType(CreateLabelDto, ['organizationId'] as const)) {}
