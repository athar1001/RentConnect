import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController, PublicApplicationController } from './applications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController, PublicApplicationController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
