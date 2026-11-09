import { DocumentsService } from './documents.service';
import type { Request, Response } from 'express';
import { DocumentType } from '@prisma/client';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadFile(req: Request, file: Express.Multer.File, title: string, type: DocumentType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
    }[]>;
    download(req: Request, id: string, res: Response): Promise<void>;
    remove(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
    }>;
    merge(req: Request, ids: string[], filename: string, res: Response): Promise<void>;
}
