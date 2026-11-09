import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        message: string;
        read: boolean;
    }[]>;
    markAllAsRead(req: Request): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAsRead(req: Request, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(req: Request, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
