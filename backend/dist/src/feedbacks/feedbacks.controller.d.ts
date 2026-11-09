import { FeedbacksService } from './feedbacks.service';
import type { Request } from 'express';
export declare class FeedbacksController {
    private readonly feedbacksService;
    constructor(feedbacksService: FeedbacksService);
    create(req: Request, body: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        createdAt: Date;
        userId: string;
        type: string;
        content: string;
    }>;
}
