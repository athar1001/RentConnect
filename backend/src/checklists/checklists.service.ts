import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, apartmentId: string, data: { title: string; isCustom?: boolean }) {
    const apt = await this.prisma.apartment.findFirst({ where: { id: apartmentId, userId } });
    if (!apt) throw new UnauthorizedException('Unauthorized access to apartment');

    return this.prisma.checklistItem.create({
      data: { ...data, apartmentId },
    });
  }

  async findAll(userId: string, apartmentId: string) {
    const apt = await this.prisma.apartment.findFirst({ where: { id: apartmentId, userId } });
    if (!apt) throw new UnauthorizedException('Unauthorized access to apartment');

    return this.prisma.checklistItem.findMany({ where: { apartmentId }, orderBy: { createdAt: 'asc' } });
  }

  async update(userId: string, id: string, data: any) {
    const item = await this.prisma.checklistItem.findUnique({ where: { id }, include: { apartment: true } });
    if (item?.apartment.userId !== userId) throw new UnauthorizedException();
    
    return this.prisma.checklistItem.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.checklistItem.findUnique({ where: { id }, include: { apartment: true } });
    if (item?.apartment.userId !== userId) throw new UnauthorizedException();

    return this.prisma.checklistItem.delete({ where: { id } });
  }
}
