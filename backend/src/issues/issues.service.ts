import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeDates } from '../common/normalize-dates';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

const DATE_KEYS = ['dueDate'] as const;

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.issue.findMany({
      orderBy: [{ boardId: 'asc' }, { position: 'asc' }],
      include: {
        board: { select: { id: true, name: true } },
        column: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        issueLabels: { include: { label: true } },
        _count: { select: { comments: true, outgoingDeps: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        board: true,
        column: true,
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        sprintIssues: { include: { sprint: true } },
        issueLabels: { include: { label: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true } } },
        },
        outgoingDeps: { include: { dependsOnIssue: { select: { id: true, title: true, status: true } } } },
        incomingDeps: { include: { issue: { select: { id: true, title: true, status: true } } } },
      },
    });
    if (!item) throw new NotFoundException('Görev bulunamadı');
    return item;
  }

  create(dto: CreateIssueDto) {
    return this.prisma.issue.create({
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async update(id: string, dto: UpdateIssueDto) {
    await this.findOneBare(id);
    return this.prisma.issue.update({
      where: { id },
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.issue.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.issue.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Görev bulunamadı');
    return item;
  }
}
