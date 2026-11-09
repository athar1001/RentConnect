import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import type { Request } from 'express';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(req: Request, createNoteDto: CreateNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }[]>;
    findOne(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    update(req: Request, id: string, updateNoteDto: UpdateNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        userId: string;
        content: string;
        tags: string | null;
        isPinned: boolean;
    }>;
    remove(req: Request, id: string): Promise<{
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
