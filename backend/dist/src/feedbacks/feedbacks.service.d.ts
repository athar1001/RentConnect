import { PrismaService } from '../prisma/prisma.service';
export declare class FeedbacksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        createdAt: Date;
        userId: string;
        type: string;
        content: string;
    }>;
}
