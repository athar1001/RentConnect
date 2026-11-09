"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillRequestDto = exports.CreateApplicationShareDto = exports.CreateApplicationReminderDto = exports.CreateApplicationNoteDto = exports.UpdateApplicationDto = exports.CreateApplicationDto = void 0;
class CreateApplicationDto {
    apartmentId;
    sharedProfileFields;
    documents;
    templateName;
    messageSubject;
    messageContent;
}
exports.CreateApplicationDto = CreateApplicationDto;
class UpdateApplicationDto {
    status;
    viewingAt;
}
exports.UpdateApplicationDto = UpdateApplicationDto;
class CreateApplicationNoteDto {
    content;
}
exports.CreateApplicationNoteDto = CreateApplicationNoteDto;
class CreateApplicationReminderDto {
    title;
    description;
    dateTime;
}
exports.CreateApplicationReminderDto = CreateApplicationReminderDto;
class CreateApplicationShareDto {
    password;
    maxViews;
    expiresInDays;
    allowDownloads;
    watermarkDocs;
}
exports.CreateApplicationShareDto = CreateApplicationShareDto;
class FulfillRequestDto {
    documentId;
}
exports.FulfillRequestDto = FulfillRequestDto;
//# sourceMappingURL=applications.dto.js.map