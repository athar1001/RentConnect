import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
export declare class NotesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createNoteDto: CreateNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    update(userId: string, id: string, updateNoteDto: UpdateNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
}
