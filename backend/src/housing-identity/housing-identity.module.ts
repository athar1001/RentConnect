import { Module } from '@nestjs/common';
import { HousingIdentityService } from './housing-identity.service';
import { HousingIdentityController, PublicProfileController } from './housing-identity.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HousingIdentityController, PublicProfileController],
  providers: [HousingIdentityService],
  exports: [HousingIdentityService],
})
export class HousingIdentityModule {}
