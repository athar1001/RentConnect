import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  apartmentId: string;
  sharedProfileFields: string[];
  documents: string[]; // Ordered list of Document IDs
  templateName: string;
  messageSubject?: string;
  messageContent: string;
}

export class UpdateApplicationDto {
  status?: ApplicationStatus;
  viewingAt?: string;
}

export class CreateApplicationNoteDto {
  content: string;
}

export class CreateApplicationReminderDto {
  title: string;
  description?: string;
  dateTime: string;
}

export class CreateApplicationShareDto {
  password?: string;
  maxViews?: number;
  expiresInDays?: number;
  allowDownloads?: boolean;
  watermarkDocs?: boolean;
}

export class FulfillRequestDto {
  documentId: string;
}
