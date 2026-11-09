import { Module } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController, ChecklistsBaseController } from './checklists.controller';

@Module({
  controllers: [ChecklistsController, ChecklistsBaseController],
  providers: [ChecklistsService],
})
export class ChecklistsModule {}
