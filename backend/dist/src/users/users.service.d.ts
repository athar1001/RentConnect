import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(userId: string): Promise<{
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
    getStats(userId: string): Promise<{
        apartments: number;
        reminders: number;
        documents: number;
        totalStorageBytes: number;
    }>;
    exportData(userId: string): Promise<{
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
    updatePassword(userId: string, data: any): Promise<{
        id: string;
    }>;
    updateSettings(userId: string, data: any): Promise<{
        email: string;
        fullName: string | null;
        id: string;
        preferredState: string | null;
        preferredCity: string | null;
        preferredLanguage: string;
        emailReminders: boolean;
        inAppReminders: boolean;
    }>;
    requestDeletion(userId: string): Promise<{
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
    getImportLogs(userId: string): Promise<{
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
}
