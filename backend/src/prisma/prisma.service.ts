import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      console.warn('⚠️ Prisma could not connect to database on startup (localhost:3306). Starting server in offline mode.');
    }
  }
}
