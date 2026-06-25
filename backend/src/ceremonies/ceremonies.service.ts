import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeDates } from '../common/normalize-dates';
import { CreateCeremonyDto } from './dto/create-ceremony.dto';
import { UpdateCeremonyDto } from './dto/update-ceremony.dto';

const DATE_KEYS = ['scheduledAt'] as const;

@Injectable()
export class CeremoniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ceremony.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        organization: { select: { id: true, name: true } },
        board: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.ceremony.findUnique({
      where: { id },
      include: {
        organization: true,
        board: true,
      },
    });
    if (!item) throw new NotFoundException('Seremoni bulunamadı');
    return item;
  }

  create(dto: CreateCeremonyDto) {
    return this.prisma.ceremony.create({
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async update(id: string, dto: UpdateCeremonyDto) {
    await this.findOneBare(id);
    return this.prisma.ceremony.update({
      where: { id },
      data: normalizeDates(dto, DATE_KEYS),
    });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.ceremony.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.ceremony.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Seremoni bulunamadı');
    return item;
  }
}
