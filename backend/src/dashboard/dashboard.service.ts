import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const org = await this.prisma.organization.findFirst();

    const [
      totalBoards,
      totalIssues,
      activeSprints,
      completedIssues,
      completedSprints,
      teamSize,
    ] = await Promise.all([
      this.prisma.board.count({ where: { isArchived: false } }),
      this.prisma.issue.count(),
      this.prisma.sprint.count({ where: { status: 'active' } }),
      this.prisma.issue.count({ where: { status: 'done' } }),
      this.prisma.sprint.findMany({
        where: { status: 'completed', velocity: { not: null } },
        select: { velocity: true },
      }),
      this.prisma.teamMember.count(),
    ]);

    const velocityAvg =
      completedSprints.length > 0
        ? Math.round(
            completedSprints.reduce((sum, s) => sum + (s.velocity ?? 0), 0) /
              completedSprints.length,
          )
        : 0;

    return {
      totalBoards,
      totalIssues,
      activeSprints,
      completedIssues,
      velocityAvg,
      teamSize,
      organization: org ? { planTier: org.planTier, analyticsEnabled: org.analyticsEnabled } : null,
    };
  }

  async getAnalytics() {
    const org = await this.prisma.organization.findFirst();
    if (org && !org.analyticsEnabled) {
      throw new ForbiddenException(
        'Gelişmiş analitik yalnızca Pro ve Kurumsal planlarda kullanılabilir. Planınızı yükseltin.',
      );
    }

    const [issuesByStatus, sprintsByBoard, recentAuditLogs] = await Promise.all([
      this.prisma.issue.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.sprint.groupBy({
        by: ['boardId'],
        _count: { _all: true },
        where: { status: 'completed' },
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    return {
      issuesByStatus: issuesByStatus.map((g) => ({
        status: g.status,
        count: g._count._all,
      })),
      completedSprintsByBoard: sprintsByBoard.map((g) => ({
        boardId: g.boardId,
        count: g._count._all,
      })),
      recentAuditLogs,
    };
  }
}
