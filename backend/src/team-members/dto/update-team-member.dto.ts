import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTeamMemberDto } from './create-team-member.dto';

export class UpdateTeamMemberDto extends PartialType(
  OmitType(CreateTeamMemberDto, ['organizationId', 'userId'] as const),
) {}
