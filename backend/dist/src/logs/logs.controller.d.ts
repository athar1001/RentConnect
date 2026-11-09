import { LogsService } from './logs.service';
import type { Request } from 'express';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    create(req: Request, apartmentId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
}
export declare class LogsBaseController {
    private readonly logsService;
    constructor(logsService: LogsService);
    update(req: Request, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
    remove(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        content: string;
        timestamp: Date;
        apartmentId: string;
    }>;
}
