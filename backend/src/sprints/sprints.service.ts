import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeDates } from '../common/normalize-dates';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

const DATE_KEYS = ['startDate', 'endDate'] as const;

@Injectable()
export class SprintsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sprint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        board: { select: { id: true, name: true } },
        _count: { select: { sprintIssues: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        board: true,
        sprintIssues: {
          include: {
            issue: {
              select: {
                id: true,
                title: true,
                status: true,
                storyPoints: true,
                assignee: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Sprint bulunamadı');
    return item;
  }

  create(dto: CreateSprintDto) {
    return this.prisma.sprint.create({
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async update(id: string, dto: UpdateSprintDto) {
    await this.findOneBare(id);
    return this.prisma.sprint.update({
      where: { id },
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.sprint.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.sprint.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Sprint bulunamadı');
    return item;
  }
}
