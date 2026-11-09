"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessShareLinkDto = exports.CreateShareLinkDto = exports.UpdateBioDto = exports.UpdateGuarantorInfoDto = exports.UpdateRentalHistoryDto = exports.UpdatePreferencesDto = exports.UpdateEmploymentInfoDto = exports.UpdateHouseholdInfoDto = exports.UpdatePersonalInfoDto = void 0;
class UpdatePersonalInfoDto {
    profilePhotoUrl;
    firstName;
    lastName;
    dateOfBirth;
    nationality;
    languages;
    phone;
    email;
    currentAddress;
    currentCity;
    postalCode;
    country;
    emergencyContact;
}
exports.UpdatePersonalInfoDto = UpdatePersonalInfoDto;
class UpdateHouseholdInfoDto {
    numberOfOccupants;
    adults;
    children;
    hasPets;
    petDetails;
    smokingStatus;
    relationshipStatus;
    movingArrangement;
}
exports.UpdateHouseholdInfoDto = UpdateHouseholdInfoDto;
class UpdateEmploymentInfoDto {
    employmentStatus;
    employer;
    position;
    startDate;
    monthlyNetIncome;
    isConfirmed;
    confirmationDocUrl;
}
exports.UpdateEmploymentInfoDto = UpdateEmploymentInfoDto;
class UpdatePreferencesDto {
    preferredCity;
    preferredDistricts;
    maxRent;
    minRooms;
    minArea;
    moveInDate;
    balcony;
    parking;
    elevator;
    furnished;
    garden;
    petsAllowed;
    accessibility;
}
exports.UpdatePreferencesDto = UpdatePreferencesDto;
class UpdateRentalHistoryDto {
    currentLandlord;
    previousLandlord;
    currentRent;
    rentalDuration;
    reasonForMoving;
    rentalReferences;
    recommendationDocUrl;
}
exports.UpdateRentalHistoryDto = UpdateRentalHistoryDto;
class UpdateGuarantorInfoDto {
    available;
    name;
    relationship;
    income;
    supportingDocsUrl;
}
exports.UpdateGuarantorInfoDto = UpdateGuarantorInfoDto;
class UpdateBioDto {
    biography;
    occupationSummary;
}
exports.UpdateBioDto = UpdateBioDto;
class CreateShareLinkDto {
    password;
    maxViews;
    expiresInDays;
    customMessage;
    permissionsJson;
}
exports.CreateShareLinkDto = CreateShareLinkDto;
class AccessShareLinkDto {
    password;
}
exports.AccessShareLinkDto = AccessShareLinkDto;
//# sourceMappingURL=update-housing-identity.dto.js.map