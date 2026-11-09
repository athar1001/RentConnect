import { ApartmentStatus } from '@prisma/client';
export declare class CreateApartmentDto {
    title: string;
    rentPrice?: number;
    warmRent?: number;
    coldRent?: number;
    deposit?: number;
    address?: string;
    city?: string;
    zipCode?: string;
    rooms?: number;
    squareMeters?: number;
    furnished?: boolean;
    balcony?: boolean;
    petsAllowed?: boolean;
    moveInDate?: Date;
    sourcePlatform?: string;
    originalListingUrl?: string;
    listingId?: string;
    coverImage?: string;
    images?: string[];
    notes?: string;
    status?: ApartmentStatus;
    energyClass?: string;
    utilityCosts?: number;
    heatingCostsIncluded?: boolean;
    heatingCosts?: number;
    constructionYear?: number;
    heatingType?: string;
    energySource?: string;
    certificateType?: string;
    description?: string;
    availability?: string;
    floor?: string;
}
export declare class UpdateApartmentDto extends CreateApartmentDto {
}
