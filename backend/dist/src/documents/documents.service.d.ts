import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    upload(userId: string, file: Express.Multer.File, title: string, type: DocumentType): Promise<{
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
    findAll(userId: string): Promise<{
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
    findOne(userId: string, id: string): Promise<{
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
    remove(userId: string, id: string): Promise<{
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
    mergeDocuments(userId: string, ids: string[]): Promise<Buffer>;
}
