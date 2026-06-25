import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PlanTier } from '@prisma/client';

const PLAN_CATALOG: Record<
  PlanTier,
  { label: string; maxBoards: number; maxUsers: number; monthlyPrice: number; features: string[] }
> = {
  starter: {
    label: 'Başlangıç',
    maxBoards: 3,
    maxUsers: 10,
    monthlyPrice: 990,
    features: ['Kanban klipları', 'Temel sprint yönetimi', '5 AI planlama kredisi'],
  },
  pro: {
    label: 'Profesyonel',
    maxBoards: 15,
    maxUsers: 50,
    monthlyPrice: 2490,
    features: ['Bağımlılık grafiği', 'Velocity analitiği', '100 AI kredisi', 'KVKK denetim izi'],
  },
  enterprise: {
    label: 'Kurumsal',
    maxBoards: 100,
    maxUsers: 500,
    monthlyPrice: 6990,
    features: ['Sınırsız analitik', 'SSO hazır altyapı', 'Öncelikli destek', 'API erişimi'],
  },
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organizasyon kaydı bulunamadı');

    const [boards, teamMembers] = await Promise.all([
      this.prisma.board.count({ where: { organizationId: org.id, isArchived: false } }),
      this.prisma.teamMember.count({ where: { organizationId: org.id } }),
    ]);

    return {
      organization: org,
      usage: {
        boards,
        teamMembers,
        boardLimit: org.maxBoards,
        userLimit: org.maxUsers,
        aiCredits: org.aiCredits,
      },
      plans: Object.entries(PLAN_CATALOG).map(([key, value]) => ({ tier: key, ...value })),
      currentPlan: { tier: org.planTier, ...PLAN_CATALOG[org.planTier] },
    };
  }

  async update(dto: UpdateSettingsDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organizasyon kaydı bulunamadı');

    const data: UpdateSettingsDto & { maxBoards?: number; maxUsers?: number; analyticsEnabled?: boolean } = {
      ...dto,
    };

    if (dto.planTier && dto.planTier !== org.planTier) {
      const plan = PLAN_CATALOG[dto.planTier];
      data.maxBoards = plan.maxBoards;
      data.maxUsers = plan.maxUsers;
      data.analyticsEnabled = dto.planTier !== 'starter';
    }

    return this.prisma.organization.update({ where: { id: org.id }, data });
  }

  async addCredits(amount: number) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organizasyon kaydı bulunamadı');
    const updated = await this.prisma.organization.update({
      where: { id: org.id },
      data: { aiCredits: { increment: amount } },
    });
    return { aiCredits: updated.aiCredits };
  }
}
