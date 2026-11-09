import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbacksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.feedback.create({
      data: {
        userId,
        type: data.type,
        content: `Subject: ${data.subject}\n\n${data.message}`,
        status: 'OPEN'
      }
    });
  }
}
