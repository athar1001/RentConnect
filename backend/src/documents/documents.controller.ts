import { Controller, Get, Post, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Body, Res } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { DocumentType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('type') type: DocumentType,
  ) {
    return this.documentsService.upload((req.user as any).userId, file, title, type);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.documentsService.findAll((req.user as any).userId);
  }

  @Get(':id/download')
  async download(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const document = await this.documentsService.findOne((req.user as any).userId, id);
    const filePath = join(process.cwd(), 'uploads', document.fileUrl);
    res.download(filePath, document.title + extname(document.fileUrl));
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.documentsService.remove((req.user as any).userId, id);
  }

  @Post('merge')
  async merge(
    @Req() req: Request,
    @Body('ids') ids: string[],
    @Body('filename') filename: string,
    @Res() res: Response,
  ) {
    const buffer = await this.documentsService.mergeDocuments((req.user as any).userId, ids);
    
    const cleanFilename = (filename || 'Apartment_Application').replace(/\.pdf$/i, '') + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
