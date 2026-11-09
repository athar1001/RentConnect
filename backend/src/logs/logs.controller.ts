import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('apartments/:apartmentId/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Req() req: Request, @Param('apartmentId') apartmentId: string, @Body() data: any) {
    return this.logsService.create((req.user as any).userId, apartmentId, data);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsBaseController {
  constructor(private readonly logsService: LogsService) {}

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() data: any) {
    return this.logsService.update((req.user as any).userId, id, data);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.logsService.remove((req.user as any).userId, id);
  }
}
