import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        issue: { select: { id: true, title: true, boardId: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        issue: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });
    if (!item) throw new NotFoundException('Yorum bulunamadı');
    return item;
  }

  create(dto: CreateCommentDto) {
    return this.prisma.comment.create({ data: dto });
  }

  async update(id: string, dto: UpdateCommentDto) {
    await this.findOneBare(id);
    return this.prisma.comment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.comment.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.comment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Yorum bulunamadı');
    return item;
  }
}
