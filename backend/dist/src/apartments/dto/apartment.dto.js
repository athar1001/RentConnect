"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApartmentDto = exports.CreateApartmentDto = void 0;
class CreateApartmentDto {
    title;
    rentPrice;
    warmRent;
    coldRent;
    deposit;
    address;
    city;
    zipCode;
    rooms;
    squareMeters;
    furnished;
    balcony;
    petsAllowed;
    moveInDate;
    sourcePlatform;
    originalListingUrl;
    listingId;
    coverImage;
    images;
    notes;
    status;
    energyClass;
    utilityCosts;
    heatingCostsIncluded;
    heatingCosts;
    constructionYear;
    heatingType;
    energySource;
    certificateType;
    description;
    availability;
    floor;
}
exports.CreateApartmentDto = CreateApartmentDto;
class UpdateApartmentDto extends CreateApartmentDto {
}
exports.UpdateApartmentDto = UpdateApartmentDto;
//# sourceMappingURL=apartment.dto.js.map