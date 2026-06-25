import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAuditLogDto } from './create-audit-log.dto';

export class UpdateAuditLogDto extends PartialType(
  OmitType(CreateAuditLogDto, ['organizationId', 'action', 'entityType', 'entityId'] as const),
) {}
