import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { ApartmentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('images', 50, {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    // Return array of public URL paths
    return { urls: files.map(file => `http://localhost:3000/public/images/${file.filename}`) };
  }

  @Post('manual')
  create(@Req() req: Request, @Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentsService.create((req.user as any).userId, createApartmentDto);
  }

  @Post('extension-import')
  extensionImport(@Req() req: Request, @Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentsService.extensionImport((req.user as any).userId, createApartmentDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.apartmentsService.findAll((req.user as any).userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.apartmentsService.findOne((req.user as any).userId, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateApartmentDto: UpdateApartmentDto) {
    return this.apartmentsService.update((req.user as any).userId, id, updateApartmentDto);
  }

  @Patch(':id/status')
  updateStatus(@Req() req: Request, @Param('id') id: string, @Body('status') status: ApartmentStatus) {
    return this.apartmentsService.updateStatus((req.user as any).userId, id, status);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.apartmentsService.remove((req.user as any).userId, id);
  }
}
