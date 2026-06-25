import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCeremonyDto } from './create-ceremony.dto';

export class UpdateCeremonyDto extends PartialType(
  OmitType(CreateCeremonyDto, ['organizationId'] as const),
) {}
