import { Controller, Get, Patch, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.notificationsService.findAll((req.user as any).userId);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: Request) {
    return this.notificationsService.markAllAsRead((req.user as any).userId);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: Request, @Param('id') id: string) {
    return this.notificationsService.markAsRead((req.user as any).userId, id);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.notificationsService.remove((req.user as any).userId, id);
  }
}
