import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File, title: string, type: DocumentType) {
    return this.prisma.document.create({
      data: {
        userId,
        title,
        type,
        fileUrl: file.filename, // Storing filename instead of path
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this document');
    }

    return document;
  }

  async remove(userId: string, id: string) {
    const document = await this.findOne(userId, id);
    
    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async mergeDocuments(userId: string, ids: string[]): Promise<Buffer> {
    if (!ids || ids.length < 2) {
      throw new BadRequestException('Select at least two documents.');
    }

    // Load all documents, checking ownership and mimetype
    const docs = await Promise.all(
      ids.map(async (id) => {
        const doc = await this.findOne(userId, id);
        const mime = doc.mimeType?.toLowerCase() || '';
        const url = doc.fileUrl?.toLowerCase() || '';
        const isPdf = mime === 'application/pdf' || url.endsWith('.pdf');
        const isPng = mime === 'image/png' || url.endsWith('.png');
        const isJpg = mime === 'image/jpeg' || mime === 'image/jpg' || url.endsWith('.jpg') || url.endsWith('.jpeg');
        
        if (!isPdf && !isPng && !isJpg) {
          throw new BadRequestException('Only PDF and image files (PNG/JPG) can be merged.');
        }
        return doc;
      })
    );

    try {
      const mergedPdf = await PDFDocument.create();

      for (const doc of docs) {
        const filePath = path.join(process.cwd(), 'uploads', doc.fileUrl);
        if (!fs.existsSync(filePath)) {
          throw new NotFoundException(`File for document "${doc.title}" not found.`);
        }
        const fileBytes = fs.readFileSync(filePath);
        
        const mime = doc.mimeType?.toLowerCase() || '';
        const url = doc.fileUrl?.toLowerCase() || '';
        const isPdfFile = mime === 'application/pdf' || url.endsWith('.pdf');
        const isPngFile = mime === 'image/png' || url.endsWith('.png');

        if (isPdfFile) {
          const pdf = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } else if (isPngFile) {
          const image = await mergedPdf.embedPng(fileBytes);
          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        } else {
          const image = await mergedPdf.embedJpg(fileBytes);
          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      return Buffer.from(mergedPdfBytes);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      console.error('PDF Merge Error:', err);
      throw new InternalServerErrorException('One or more documents could not be processed.');
    }
  }
}
