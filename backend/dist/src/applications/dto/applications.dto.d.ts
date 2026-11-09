import { ApplicationStatus } from '@prisma/client';
export declare class CreateApplicationDto {
    apartmentId: string;
    sharedProfileFields: string[];
    documents: string[];
    templateName: string;
    messageSubject?: string;
    messageContent: string;
}
export declare class UpdateApplicationDto {
    status?: ApplicationStatus;
    viewingAt?: string;
}
export declare class CreateApplicationNoteDto {
    content: string;
}
export declare class CreateApplicationReminderDto {
    title: string;
    description?: string;
    dateTime: string;
}
export declare class CreateApplicationShareDto {
    password?: string;
    maxViews?: number;
    expiresInDays?: number;
    allowDownloads?: boolean;
    watermarkDocs?: boolean;
}
export declare class FulfillRequestDto {
    documentId: string;
}
