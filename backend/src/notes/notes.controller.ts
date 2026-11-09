import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Req() req: Request, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create((req.user as any).userId, createNoteDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.notesService.findAll((req.user as any).userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.notesService.findOne((req.user as any).userId, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update((req.user as any).userId, id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.notesService.remove((req.user as any).userId, id);
  }
}
