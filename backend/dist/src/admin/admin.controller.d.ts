import { AdminService } from './admin.service';
import type { Request } from 'express';
import { UserStatus, FeedbackStatus } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisWeek: number;
        totalApartments: number;
        totalImports: number;
        failedImports: number;
        totalDocuments: number;
        upcomingReminders: number;
        feedbackMessages: number;
        recentImports: ({
            user: {
                email: string;
            } | null;
        } & {
            error: string | null;
            id: string;
            status: string;
            createdAt: Date;
            userId: string | null;
            url: string;
            apartmentId: string | null;
            platform: string | null;
            isExtension: boolean;
        })[];
        extensionImportsCount: number;
        extensionFailedImports: number;
        extensionSuccessRate: number;
        extensionPlatformStats: {
            platform: string;
            total: number;
            successRate: number;
        }[];
    }>;
    getUsers(): Promise<{
        email: string;
        fullName: string | null;
        id: string;
        preferredLanguage: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        createdAt: Date;
    }[]>;
    updateUserStatus(req: Request, id: string, status: UserStatus): Promise<{
        success: boolean;
    }>;
    getImports(): Promise<({
        user: {
            email: string;
        } | null;
    } & {
        error: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userId: string | null;
        url: string;
        apartmentId: string | null;
        platform: string | null;
        isExtension: boolean;
    })[]>;
    getScraperHealth(): Promise<{
        platform: string;
        total: number;
        successRate: number;
    }[] | {
        platforms: never[];
    }>;
    getApartments(): Promise<{
        user: {
            email: string;
        };
        id: string;
        status: import(".prisma/client").$Enums.ApartmentStatus;
        createdAt: Date;
        title: string;
        city: string | null;
        sourcePlatform: string | null;
    }[]>;
    getDocuments(): Promise<{
        user: {
            email: string;
        };
        id: string;
        createdAt: Date;
        title: string;
        type: import(".prisma/client").$Enums.DocumentType;
        fileSize: number | null;
        mimeType: string | null;
    }[]>;
    getFeedbacks(): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        createdAt: Date;
        userId: string;
        type: string;
        content: string;
    })[]>;
    updateFeedbackStatus(req: Request, id: string, status: FeedbackStatus): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        createdAt: Date;
        userId: string;
        type: string;
        content: string;
    }>;
    getReminders(): Promise<({
        user: {
            email: string;
        };
        apartment: {
            title: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        userId: string;
        type: import(".prisma/client").$Enums.ReminderType;
        apartmentId: string | null;
        dateTime: Date;
        completed: boolean;
    })[]>;
    getGdprRequests(): Promise<{
        email: string;
        fullName: string | null;
        id: string;
        createdAt: Date;
    }[]>;
    getAuditLogs(): Promise<({
        admin: {
            email: string;
        };
    } & {
        id: string;
        timestamp: Date;
        adminId: string;
        action: string;
        targetEntity: string;
        ipAddress: string | null;
    })[]>;
}
