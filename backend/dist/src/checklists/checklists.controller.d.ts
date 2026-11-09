import { ChecklistsService } from './checklists.service';
import type { Request } from 'express';
export declare class ChecklistsController {
    private readonly checklistsService;
    constructor(checklistsService: ChecklistsService);
    create(req: Request, apartmentId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
    findAll(req: Request, apartmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }[]>;
}
export declare class ChecklistsBaseController {
    private readonly checklistsService;
    constructor(checklistsService: ChecklistsService);
    update(req: Request, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
    remove(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        apartmentId: string;
        completed: boolean;
        isCustom: boolean;
    }>;
}
