import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        organization: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!item) throw new NotFoundException('Denetim kaydı bulunamadı');
    return item;
  }

  create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({ data: dto });
  }

  async update(id: string, dto: UpdateAuditLogDto) {
    await this.findOneBare(id);
    return this.prisma.auditLog.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.auditLog.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Denetim kaydı bulunamadı');
    return item;
  }
}
