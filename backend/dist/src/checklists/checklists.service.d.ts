import { PrismaService } from '../prisma/prisma.service';
export declare class ChecklistsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, apartmentId: string, data: {
        title: string;
        isCustom?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
    findAll(userId: string, apartmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }[]>;
    update(userId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
}
