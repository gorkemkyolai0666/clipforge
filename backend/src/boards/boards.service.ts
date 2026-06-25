import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { issues: true, sprints: true, columns: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.board.findUnique({
      where: { id },
      include: {
        organization: true,
        columns: { orderBy: { position: 'asc' } },
        sprints: { orderBy: { createdAt: 'desc' } },
        _count: { select: { issues: true } },
      },
    });
    if (!item) throw new NotFoundException('Klip bulunamadı');
    return item;
  }

  private async enforceBoardLimit(organizationId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) return;
    const count = await this.prisma.board.count({
      where: { organizationId, isArchived: false },
    });
    if (count >= org.maxBoards) {
      throw new ForbiddenException(
        `${org.planTier.toUpperCase()} planınızın klip limitine (${org.maxBoards}) ulaştınız. Planınızı yükseltin.`,
      );
    }
  }

  async create(dto: CreateBoardDto) {
    await this.enforceBoardLimit(dto.organizationId);
    return this.prisma.board.create({ data: dto });
  }

  async update(id: string, dto: UpdateBoardDto) {
    await this.findOneBare(id);
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.board.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.board.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Klip bulunamadı');
    return item;
  }
}
