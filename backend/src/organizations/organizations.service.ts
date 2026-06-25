import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { boards: true, teamMembers: true, labels: true } },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        boards: { where: { isArchived: false }, orderBy: { name: 'asc' } },
        teamMembers: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        labels: true,
      },
    });
    if (!item) throw new NotFoundException('Organizasyon bulunamadı');
    return item;
  }

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOneBare(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneBare(id);
    return this.prisma.organization.delete({ where: { id } });
  }

  private async findOneBare(id: string) {
    const item = await this.prisma.organization.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Organizasyon bulunamadı');
    return item;
  }
}
