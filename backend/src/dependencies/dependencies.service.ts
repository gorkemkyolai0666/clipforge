import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { UpdateDependencyDto } from './dto/update-dependency.dto';

@Injectable()
export class DependenciesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.dependency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        issue: { select: { id: true, title: true, status: true, boardId: true } },
        dependsOnIssue: { select: { id: true, title: true, status: true, boardId: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.dependency.findUnique({
      where: { id },
      include: {
        issue: true,
        dependsOnIssue: true,
      },
    });
    if (!item) throw new NotFoundException('Bağımlılık bulunamadı');
    return item;
  }

  create(dto: CreateDependencyDto) {
    return this.prisma.dependency.create({ data: dto });
  }

  async update(id: string, dto: UpdateDependencyDto) {
    await this.findOneBare(id);
    return this.prisma.dependency.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.dependency.delete({ where: { id } });
  }


          async getRadar() {
            const deps = await this.prisma.dependency.findMany({
              include: {
                issue: {
                  select: { id: true, title: true, status: true, boardId: true, board: { select: { name: true } } },
                },
                dependsOnIssue: {
                  select: { id: true, title: true, status: true, boardId: true, board: { select: { name: true } } },
                },
              },
            });
            const nodes = new Map<string, { id: string; title: string; board: string; status: string }>();
            const links: Array<{ source: string; target: string; type: string }> = [];
            for (const d of deps) {
              nodes.set(d.issue.id, {
                id: d.issue.id,
                title: d.issue.title,
                board: d.issue.board?.name || '',
                status: d.issue.status,
              });
              nodes.set(d.dependsOnIssue.id, {
                id: d.dependsOnIssue.id,
                title: d.dependsOnIssue.title,
                board: d.dependsOnIssue.board?.name || '',
                status: d.dependsOnIssue.status,
              });
              links.push({ source: d.issue.id, target: d.dependsOnIssue.id, type: d.type });
            }
            return { nodes: Array.from(nodes.values()), links, linkCount: links.length };
          }

          async getBlastRadius(issueId: string) {
            const all = await this.prisma.dependency.findMany({
              where: { type: 'blocks' },
              include: {
                issue: { select: { id: true, title: true, status: true, board: { select: { name: true } } } },
                dependsOnIssue: { select: { id: true, title: true, status: true, board: { select: { name: true } } } },
              },
            });
            const affected = new Set<string>();
            const queue = [issueId];
            const details: Array<{ id: string; title: string; board: string; depth: number }> = [];
            while (queue.length) {
              const current = queue.shift()!;
              for (const d of all) {
                if (d.dependsOnIssue.id === current && !affected.has(d.issue.id)) {
                  affected.add(d.issue.id);
                  details.push({
                    id: d.issue.id,
                    title: d.issue.title,
                    board: d.issue.board?.name || '',
                    depth: details.filter((x) => x.id === current).length + 1,
                  });
                  queue.push(d.issue.id);
                }
              }
            }
            return {
              rootIssueId: issueId,
              blastRadius: affected.size,
              affectedIssues: details,
            };
          }

  private async findOneBare(id: string) {
    const item = await this.prisma.dependency.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Bağımlılık bulunamadı');
    return item;
  }
}
