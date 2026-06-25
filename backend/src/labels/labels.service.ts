import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.label.findMany({
      orderBy: { name: 'asc' },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { issueLabels: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.label.findUnique({
      where: { id },
      include: {
        organization: true,
        issueLabels: {
          include: { issue: { select: { id: true, title: true, status: true } } },
        },
      },
    });
    if (!item) throw new NotFoundException('Etiket bulunamadı');
    return item;
  }

  create(dto: CreateLabelDto) {
    return this.prisma.label.create({ data: dto });
  }

  async update(id: string, dto: UpdateLabelDto) {
    await this.findOneBare(id);
    return this.prisma.label.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.label.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.label.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Etiket bulunamadı');
    return item;
  }
}
