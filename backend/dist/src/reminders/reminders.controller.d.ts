import { RemindersService } from './reminders.service';
import type { Request } from 'express';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    create(req: Request, data: any): import(".prisma/client").Prisma.Prisma__ReminderClient<{
        id: string;
        title: string;
        description: string | null;
        type: import(".prisma/client").$Enums.ReminderType;
        dateTime: Date;
        completed: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(req: Request): import(".prisma/client").Prisma.PrismaPromise<({
        apartment: {
            id: string;
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
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
            status: import(".prisma/client").$Enums.ApartmentStatus;
            energyClass: string | null;
            utilityCosts: number | null;
            heatingCostsIncluded: boolean;
            heatingCosts: number | null;
            constructionYear: number | null;
            heatingType: string | null;
            energySource: string | null;
            certificateType: string | null;
            availability: string | null;
            floor: string | null;
        } | null;
    } & {
        id: string;
        title: string;
        description: string | null;
        type: import(".prisma/client").$Enums.ReminderType;
        dateTime: Date;
        completed: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string | null;
    })[]>;
    update(req: Request, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(req: Request, id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
