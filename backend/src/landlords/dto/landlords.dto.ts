import { PropertyStatus, ViewingStatus } from '@prisma/client';

export class CreatePropertyDto {
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

export class UpdatePropertyDto {
  title?: string;
  address?: string;
  rentPrice?: number;
  status?: PropertyStatus;
  description?: string;
}

export class CreateViewingDto {
  propertyId: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  durationMins?: number;
  location?: string;
  notes?: string;
}

export class CreateLandlordNoteDto {
  applicationId: string;
  content: string;
}

export class CreateLandlordMessageDto {
  applicationId: string;
  content: string;
}

export class CompareApplicantsDto {
  applicationIds: string[];
}
