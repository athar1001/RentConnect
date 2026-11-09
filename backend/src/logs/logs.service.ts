import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, apartmentId: string, data: { type: string; content: string }) {
    // Basic verification that apartment belongs to user
    const apt = await this.prisma.apartment.findFirst({ where: { id: apartmentId, userId } });
    if (!apt) throw new UnauthorizedException('Unauthorized access to apartment');

    return this.prisma.communicationLog.create({
      data: { ...data, apartmentId },
    });
  }

  async update(userId: string, id: string, data: any) {
    const log = await this.prisma.communicationLog.findUnique({ where: { id }, include: { apartment: true } });
    if (log?.apartment.userId !== userId) throw new UnauthorizedException();
    
    return this.prisma.communicationLog.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const log = await this.prisma.communicationLog.findUnique({ where: { id }, include: { apartment: true } });
    if (log?.apartment.userId !== userId) throw new UnauthorizedException();

    return this.prisma.communicationLog.delete({ where: { id } });
  }
}
