import { Injectable } from '@nestjs/common';
import { IssuePriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TriageService {
  constructor(private readonly prisma: PrismaService) {}

  async getInbox() {
    const issues = await this.prisma.issue.findMany({
      where: {
        OR: [
          { assigneeId: null },
          { status: { in: ['backlog', 'todo'] } },
        ],
      },
      include: {
        assignee: { select: { id: true, name: true } },
        board: { select: { id: true, name: true } },
        issueLabels: { include: { label: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 100,
    });

    const pipelines = this.pipelineIssues(issues);
    const rules = await this.prisma.triageRule.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      issues: issues.map((issue) => ({
        ...issue,
        triageScore: this.scoreIssue(issue),
        suggestedCluster: this.findCluster(issue, pipelines),
        suggestedAssignee: this.suggestAssignee(issue, rules),
      })),
      pipelines,
      ruleCount: rules.length,
    };
  }

  findRules() {
    return this.prisma.triageRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createRule(data: {
    organizationId: string;
    name: string;
    labelPattern?: string;
    priority?: IssuePriority;
    assigneeId?: string;
  }) {
    return this.prisma.triageRule.create({ data });
  }

  private scoreIssue(issue: {
    priority: string;
    assigneeId: string | null;
    createdAt: Date;
  }) {
    let score = 0;
    if (!issue.assigneeId) score += 30;
    if (issue.priority === 'critical') score += 40;
    else if (issue.priority === 'high') score += 25;
    else if (issue.priority === 'medium') score += 10;
    const ageDays = (Date.now() - issue.createdAt.getTime()) / 86400000;
    score += Math.min(30, Math.floor(ageDays * 3));
    return score;
  }

  private pipelineIssues(issues: Array<{ title: string; description: string }>) {
    const buckets: Record<string, number> = {};
    const keywords = ['sync', 'conflict', 'version', 'duplicate', 'merge', 'doc', 'pipeline', 'drift'];
    for (const issue of issues) {
      const text = `${issue.title} ${issue.description}`.toLowerCase();
      for (const kw of keywords) {
        if (text.includes(kw)) {
          const label = kw.toUpperCase();
          buckets[label] = (buckets[label] || 0) + 1;
        }
      }
    }
    return Object.entries(buckets)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  private findCluster(
    issue: { title: string; description: string },
    pipelines: Array<{ name: string }>,
  ) {
    const text = `${issue.title} ${issue.description}`.toLowerCase();
    for (const c of pipelines) {
      if (text.includes(c.name.toLowerCase())) return c.name;
    }
    return null;
  }

  private suggestAssignee(
    issue: { title: string; description: string; issueLabels?: Array<{ label: { name: string } }> },
    rules: Array<{ labelPattern: string; assigneeId: string | null }>,
  ) {
    const labels = (issue.issueLabels || []).map((il) => il.label.name.toLowerCase());
    const text = `${issue.title} ${issue.description}`.toLowerCase();
    for (const rule of rules) {
      const pat = rule.labelPattern.toLowerCase();
      if (pat && (labels.some((l) => l.includes(pat)) || text.includes(pat))) {
        return rule.assigneeId;
      }
    }
    return null;
  }
}
