import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('apartments/:apartmentId/checklist')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  create(@Req() req: Request, @Param('apartmentId') apartmentId: string, @Body() data: any) {
    return this.checklistsService.create((req.user as any).userId, apartmentId, data);
  }

  @Get()
  findAll(@Req() req: Request, @Param('apartmentId') apartmentId: string) {
    return this.checklistsService.findAll((req.user as any).userId, apartmentId);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('checklist')
export class ChecklistsBaseController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() data: any) {
    return this.checklistsService.update((req.user as any).userId, id, data);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.checklistsService.remove((req.user as any).userId, id);
  }
}
