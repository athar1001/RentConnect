import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto, CreateApplicationNoteDto, CreateApplicationReminderDto, CreateApplicationShareDto, FulfillRequestDto } from './dto/applications.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    getApplications(req: any, status?: string, search?: string, sort?: string): Promise<({
        apartment: {
            title: string;
            rentPrice: number | null;
            warmRent: number | null;
            address: string | null;
            city: string | null;
            coverImage: string | null;
        };
        documents: ({
            document: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                userId: string;
                type: import(".prisma/client").$Enums.DocumentType;
                fileUrl: string;
                fileSize: number | null;
                mimeType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            applicationId: string;
            orderIndex: number;
            documentId: string;
        })[];
        sharing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            token: string;
            revoked: boolean;
            passwordHash: string | null;
            maxViews: number | null;
            viewCount: number;
            expiresAt: Date | null;
            applicationId: string;
            allowDownloads: boolean;
            watermarkDocs: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string;
        propertyId: string | null;
        referenceNumber: string;
        sharedProfileFields: string;
        appliedAt: Date | null;
        viewingAt: Date | null;
    })[]>;
    getAnalytics(req: any): Promise<{
        total: number;
        sent: number;
        pending: number;
        viewings: number;
        offers: number;
        rejected: number;
        withdrawn: number;
        responseRate: number;
        averageResponseTimeDays: number;
        averageViewingTimeDays: number;
        averageOfferTimeDays: number;
    }>;
    getApplication(req: any, id: string): Promise<{
        apartment: {
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
        };
        documents: ({
            document: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                userId: string;
                type: import(".prisma/client").$Enums.DocumentType;
                fileUrl: string;
                fileSize: number | null;
                mimeType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            applicationId: string;
            orderIndex: number;
            documentId: string;
        })[];
        reminders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            dateTime: Date;
            completed: boolean;
            applicationId: string;
        }[];
        notes: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            applicationId: string;
        }[];
        documentRequests: ({
            document: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                userId: string;
                type: import(".prisma/client").$Enums.DocumentType;
                fileUrl: string;
                fileSize: number | null;
                mimeType: string | null;
            } | null;
        } & {
            id: string;
            description: string | null;
            applicationId: string;
            requestedAt: Date;
            documentId: string | null;
            requestedType: string;
            isFulfilled: boolean;
            fulfilledAt: Date | null;
        })[];
        message: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            subject: string | null;
            applicationId: string;
            templateName: string;
        } | null;
        timeline: {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            createdAt: Date;
            notes: string | null;
            applicationId: string;
            eventType: import(".prisma/client").$Enums.TimelineEventType;
            actor: import(".prisma/client").$Enums.TimelineActor;
            actorName: string | null;
            metadata: string | null;
        }[];
        sharing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            token: string;
            revoked: boolean;
            passwordHash: string | null;
            maxViews: number | null;
            viewCount: number;
            expiresAt: Date | null;
            applicationId: string;
            allowDownloads: boolean;
            watermarkDocs: boolean;
        } | null;
        activityLogs: {
            id: string;
            createdAt: Date;
            description: string;
            action: string;
            ipAddress: string | null;
            applicationId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string;
        propertyId: string | null;
        referenceNumber: string;
        sharedProfileFields: string;
        appliedAt: Date | null;
        viewingAt: Date | null;
    }>;
    create(req: any, dto: CreateApplicationDto): Promise<{
        apartment: {
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
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string;
        propertyId: string | null;
        referenceNumber: string;
        sharedProfileFields: string;
        appliedAt: Date | null;
        viewingAt: Date | null;
    }>;
    update(req: any, id: string, dto: UpdateApplicationDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        apartmentId: string;
        propertyId: string | null;
        referenceNumber: string;
        sharedProfileFields: string;
        appliedAt: Date | null;
        viewingAt: Date | null;
    }>;
    addNote(req: any, id: string, dto: CreateApplicationNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        applicationId: string;
    }>;
    addReminder(req: any, id: string, dto: CreateApplicationReminderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dateTime: Date;
        completed: boolean;
        applicationId: string;
    }>;
    createSharing(req: any, id: string, dto: CreateApplicationShareDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        revoked: boolean;
        passwordHash: string | null;
        maxViews: number | null;
        viewCount: number;
        expiresAt: Date | null;
        applicationId: string;
        allowDownloads: boolean;
        watermarkDocs: boolean;
    }>;
    revokeSharing(req: any, id: string): Promise<{
        success: boolean;
    }>;
    fulfillDocumentRequest(req: any, id: string, requestId: string, dto: FulfillRequestDto): Promise<{
        id: string;
        description: string | null;
        applicationId: string;
        requestedAt: Date;
        documentId: string | null;
        requestedType: string;
        isFulfilled: boolean;
        fulfilledAt: Date | null;
    }>;
    withdraw(req: any, id: string): Promise<{
        success: boolean;
    }>;
    requestDocument(req: any, id: string, requestedType: string, description?: string): Promise<{
        id: string;
        description: string | null;
        applicationId: string;
        requestedAt: Date;
        documentId: string | null;
        requestedType: string;
        isFulfilled: boolean;
        fulfilledAt: Date | null;
    }>;
    getTimelineFeed(id: string): Promise<{
        applicationId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        referenceNumber: string;
        apartmentTitle: string;
        timeline: ({
            comments: {
                id: string;
                createdAt: Date;
                content: string;
                senderType: string;
                senderName: string;
                timelineId: string;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            createdAt: Date;
            notes: string | null;
            applicationId: string;
            eventType: import(".prisma/client").$Enums.TimelineEventType;
            actor: import(".prisma/client").$Enums.TimelineActor;
            actorName: string | null;
            metadata: string | null;
        })[];
        documentRequests: ({
            document: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                userId: string;
                type: import(".prisma/client").$Enums.DocumentType;
                fileUrl: string;
                fileSize: number | null;
                mimeType: string | null;
            } | null;
        } & {
            id: string;
            description: string | null;
            applicationId: string;
            requestedAt: Date;
            documentId: string | null;
            requestedType: string;
            isFulfilled: boolean;
            fulfilledAt: Date | null;
        })[];
        viewings: {
            id: string;
            status: import(".prisma/client").$Enums.ViewingStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            title: string;
            location: string | null;
            propertyId: string;
            applicationId: string;
            scheduledAt: Date;
            durationMins: number;
        }[];
        offers: {
            id: string;
            status: import(".prisma/client").$Enums.OfferStatus;
            createdAt: Date;
            updatedAt: Date;
            rentPrice: number;
            deposit: number | null;
            moveInDate: Date;
            applicationId: string;
            terms: string | null;
        }[];
        activityLogs: {
            id: string;
            createdAt: Date;
            description: string;
            action: string;
            ipAddress: string | null;
            applicationId: string;
        }[];
    }>;
    addTimelineComment(timelineId: string, senderType: string, senderName: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        senderType: string;
        senderName: string;
        timelineId: string;
    }>;
    respondToViewing(id: string, viewingId: string, action: 'ACCEPT' | 'DECLINE' | 'RESCHEDULE', notes?: string): Promise<{
        success: boolean;
        action: "ACCEPT" | "DECLINE" | "RESCHEDULE";
    }>;
    respondToOffer(id: string, offerId: string, action: 'ACCEPT' | 'DECLINE'): Promise<{
        success: boolean;
        status: string;
    }>;
}
export declare class PublicApplicationController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    getPublicApplication(token: string, password?: string): Promise<{
        passwordRequired: boolean;
        token: string;
        apartment?: undefined;
        applicantName?: undefined;
        message?: undefined;
        profile?: undefined;
        documents?: undefined;
        sharingConfig?: undefined;
    } | {
        passwordRequired: boolean;
        apartment: {
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
        };
        applicantName: string;
        message: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            subject: string | null;
            applicationId: string;
            templateName: string;
        } | null;
        profile: any;
        documents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            userId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileSize: number | null;
            mimeType: string | null;
        }[];
        sharingConfig: {
            allowDownloads: boolean;
            watermarkDocs: boolean;
            referenceNumber: string;
            appliedAt: Date;
        };
        token?: undefined;
    }>;
    accessPublicApplicationWithPassword(token: string, password?: string): Promise<{
        passwordRequired: boolean;
        token: string;
        apartment?: undefined;
        applicantName?: undefined;
        message?: undefined;
        profile?: undefined;
        documents?: undefined;
        sharingConfig?: undefined;
    } | {
        passwordRequired: boolean;
        apartment: {
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
        };
        applicantName: string;
        message: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            subject: string | null;
            applicationId: string;
            templateName: string;
        } | null;
        profile: any;
        documents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            userId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileSize: number | null;
            mimeType: string | null;
        }[];
        sharingConfig: {
            allowDownloads: boolean;
            watermarkDocs: boolean;
            referenceNumber: string;
            appliedAt: Date;
        };
        token?: undefined;
    }>;
}
