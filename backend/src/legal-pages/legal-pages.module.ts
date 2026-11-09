import { Module } from '@nestjs/common';
import { LegalPagesService } from './legal-pages.service';
import { LegalPagesController } from './legal-pages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
  exports: [LegalPagesService],
})
export class LegalPagesModule {}
