import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController, LogsBaseController } from './logs.controller';

@Module({
  providers: [LogsService],
  controllers: [LogsController, LogsBaseController]
})
export class LogsModule {}
