import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeDates } from '../common/normalize-dates';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

const DATE_KEYS = ['joinedAt'] as const;

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: { joinedAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        organization: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!item) throw new NotFoundException('Ekip üyesi bulunamadı');
    return item;
  }

  private async enforceUserLimit(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return;
    const count = await this.prisma.teamMember.count({ where: { organizationId } });
    if (count >= org.maxUsers) {
      throw new ForbiddenException(
        `${org.planTier.toUpperCase()} planınızın kullanıcı limitine (${org.maxUsers}) ulaştınız. Planınızı yükseltin.`,
      );
    }
  }

  async create(dto: CreateTeamMemberDto) {
    await this.enforceUserLimit(dto.organizationId);
    return this.prisma.teamMember.create({
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.findOneBare(id);
    return this.prisma.teamMember.update({
      where: { id },
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ekip üyesi bulunamadı');
    return item;
  }
}
