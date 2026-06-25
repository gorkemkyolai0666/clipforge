import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.column.findMany({
      orderBy: [{ boardId: 'asc' }, { position: 'asc' }],
      include: {
        board: { select: { id: true, name: true } },
        _count: { select: { issues: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.column.findUnique({
      where: { id },
      include: {
        board: true,
        issues: { orderBy: { position: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Sütun bulunamadı');
    return item;
  }

  create(dto: CreateColumnDto) {
    return this.prisma.column.create({ data: dto });
  }

  async update(id: string, dto: UpdateColumnDto) {
    await this.findOneBare(id);
    return this.prisma.column.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.column.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.column.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Sütun bulunamadı');
    return item;
  }
}
