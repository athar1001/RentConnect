"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareApplicantsDto = exports.CreateLandlordMessageDto = exports.CreateLandlordNoteDto = exports.CreateViewingDto = exports.UpdatePropertyDto = exports.CreatePropertyDto = void 0;
class CreatePropertyDto {
    title;
    address;
    city;
    zipCode;
    rentPrice;
    warmRent;
    coldRent;
    deposit;
    rooms;
    squareMeters;
    floor;
    availability;
    status;
    description;
    listingUrl;
    coverImage;
}
exports.CreatePropertyDto = CreatePropertyDto;
class UpdatePropertyDto {
    title;
    address;
    rentPrice;
    status;
    description;
}
exports.UpdatePropertyDto = UpdatePropertyDto;
class CreateViewingDto {
    propertyId;
    applicationId;
    title;
    scheduledAt;
    durationMins;
    location;
    notes;
}
exports.CreateViewingDto = CreateViewingDto;
class CreateLandlordNoteDto {
    applicationId;
    content;
}
exports.CreateLandlordNoteDto = CreateLandlordNoteDto;
class CreateLandlordMessageDto {
    applicationId;
    content;
}
exports.CreateLandlordMessageDto = CreateLandlordMessageDto;
class CompareApplicantsDto {
    applicationIds;
}
exports.CompareApplicantsDto = CompareApplicantsDto;
//# sourceMappingURL=landlords.dto.js.map