import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Req() req: Request, @Body() data: any) {
    return this.remindersService.create((req.user as any).userId, data);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.remindersService.findAll((req.user as any).userId);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() data: any) {
    return this.remindersService.update((req.user as any).userId, id, data);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.remindersService.remove((req.user as any).userId, id);
  }
}
