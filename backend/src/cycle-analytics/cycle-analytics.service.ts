import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CycleAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeatmap() {
    const labels = await this.prisma.label.findMany({
      include: { issueLabels: { include: { issue: true } } },
    });
    const statuses = ['permission', 'pipeline', 'converge', 'synthesize', 'tamamlandi'];
    const cells: Array<{
      label: string;
      status: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      wipOverload: boolean;
    }> = [];

    for (const label of labels) {
      for (const status of statuses) {
        const count = label.issueLabels.filter((il) => il.issue.status === status).length;
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (count > 8) severity = 'critical';
        else if (count > 5) severity = 'high';
        else if (count > 2) severity = 'medium';
        cells.push({
          label: label.name,
          status,
          count,
          severity,
          wipOverload: status === 'chapter' && count > 8,
        });
      }
    }

    const columns = await this.prisma.column.findMany({
      include: { issues: true },
    });
    const wipWarnings = columns
      .filter((c) => c.wipLimit && c.issues.length > c.wipLimit)
      .map((c) => ({
        column: c.name,
        current: c.issues.length,
        limit: c.wipLimit,
      }));

    return { cells, wipWarnings, generatedAt: new Date().toISOString() };
  }

  async getForecast() {
    const issues = await this.prisma.issue.findMany({
      where: { status: 'done' },
      include: { issueLabels: { include: { label: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    const labelStats: Record<string, { totalDays: number; count: number }> = {};
    for (const issue of issues) {
      const days = Math.max(
        1,
        (issue.updatedAt.getTime() - issue.createdAt.getTime()) / 86400000,
      );
      const labels = issue.issueLabels.map((il) => il.label.name);
      const keys = labels.length ? labels : ['Genel'];
      for (const k of keys) {
        if (!labelStats[k]) labelStats[k] = { totalDays: 0, count: 0 };
        labelStats[k].totalDays += days;
        labelStats[k].count += 1;
      }
    }

    const forecasts = Object.entries(labelStats).map(([label, s]) => ({
      label,
      avgCycleDays: Math.round((s.totalDays / s.count) * 10) / 10,
      predictedDays: Math.round((s.totalDays / s.count) * 1.1 * 10) / 10,
      sampleSize: s.count,
    }));

    const cycles = await this.prisma.sprint.findMany({
      where: { status: 'completed' },
      orderBy: { endDate: 'desc' },
      take: 6,
      include: { sprintIssues: true },
    });

    return {
      forecasts: forecasts.sort((a, b) => b.avgCycleDays - a.avgCycleDays),
      cycleVelocity: cycles.map((c) => ({
        name: c.name,
        velocity: c.velocity || c.sprintIssues.length,
        issueCount: c.sprintIssues.length,
      })),
    };
  }
}
