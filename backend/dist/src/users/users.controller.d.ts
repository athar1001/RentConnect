import { UsersService } from './users.service';
import type { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getSettings(req: Request): Promise<{
        email: string;
        fullName: string | null;
        id: string;
        preferredState: string | null;
        preferredCity: string | null;
        preferredLanguage: string;
        emailReminders: boolean;
        inAppReminders: boolean;
        extensionConnected: boolean;
    } | null>;
    updateSettings(req: Request, body: any): Promise<{
        email: string;
        fullName: string | null;
        id: string;
        preferredState: string | null;
        preferredCity: string | null;
        preferredLanguage: string;
        emailReminders: boolean;
        inAppReminders: boolean;
    }>;
    getImportLogs(req: Request): Promise<{
        error: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userId: string | null;
        url: string;
        apartmentId: string | null;
        platform: string | null;
        isExtension: boolean;
    }[]>;
    getStats(req: Request): Promise<{
        apartments: number;
        reminders: number;
        documents: number;
        totalStorageBytes: number;
    }>;
    exportData(req: Request): Promise<{
        apartments: ({
            logs: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                content: string;
                timestamp: Date;
                apartmentId: string;
            }[];
            checklists: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                apartmentId: string;
                completed: boolean;
                isCustom: boolean;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApartmentStatus;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            rentPrice: number | null;
            warmRent: number | null;
            coldRent: number | null;
            deposit: number | null;
            address: string | null;
            city: string | null;
            zipCode: string | null;
            rooms: number | null;
            squareMeters: number | null;
            furnished: boolean;
            balcony: boolean;
            petsAllowed: boolean;
            moveInDate: Date | null;
            sourcePlatform: string | null;
            originalListingUrl: string | null;
            listingId: string | null;
            coverImage: string | null;
            energyClass: string | null;
            utilityCosts: number | null;
            heatingCostsIncluded: boolean;
            heatingCosts: number | null;
            constructionYear: number | null;
            heatingType: string | null;
            energySource: string | null;
            certificateType: string | null;
            description: string | null;
            availability: string | null;
            floor: string | null;
            userId: string;
        })[];
        documents: {
            id: string;
            createdAt: Date;
            title: string;
            type: import(".prisma/client").$Enums.DocumentType;
            fileSize: number | null;
        }[];
        reminders: {
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
        }[];
        notes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            userId: string;
            content: string;
            tags: string | null;
            isPinned: boolean;
        }[];
        email: string;
        fullName: string | null;
        id: string;
        preferredState: string | null;
        preferredCity: string | null;
        preferredLanguage: string;
        emailReminders: boolean;
        inAppReminders: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        deletionRequested: boolean;
        extensionConnected: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePassword(req: Request, body: any): Promise<{
        id: string;
    }>;
    requestDeletion(req: Request): Promise<{
        email: string;
        password: string;
        fullName: string | null;
        id: string;
        preferredState: string | null;
        preferredCity: string | null;
        preferredLanguage: string;
        emailReminders: boolean;
        inAppReminders: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        deletionRequested: boolean;
        extensionConnected: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
