import { PropertyStatus } from '@prisma/client';
export declare class CreatePropertyDto {
    title: string;
    address: string;
    city?: string;
    zipCode?: string;
    rentPrice: number;
    warmRent?: number;
    coldRent?: number;
    deposit?: number;
    rooms: number;
    squareMeters: number;
    floor?: string;
    availability?: string;
    status?: PropertyStatus;
    description?: string;
    listingUrl?: string;
    coverImage?: string;
}
export declare class UpdatePropertyDto {
    title?: string;
    address?: string;
    rentPrice?: number;
    status?: PropertyStatus;
    description?: string;
}
export declare class CreateViewingDto {
    propertyId: string;
    applicationId: string;
    title: string;
    scheduledAt: string;
    durationMins?: number;
    location?: string;
    notes?: string;
}
export declare class CreateLandlordNoteDto {
    applicationId: string;
    content: string;
}
export declare class CreateLandlordMessageDto {
    applicationId: string;
    content: string;
}
export declare class CompareApplicantsDto {
    applicationIds: string[];
}
