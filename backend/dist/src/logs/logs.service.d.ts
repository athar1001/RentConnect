import { PrismaService } from '../prisma/prisma.service';
export declare class LogsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, apartmentId: string, data: {
        type: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
    update(userId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
}
