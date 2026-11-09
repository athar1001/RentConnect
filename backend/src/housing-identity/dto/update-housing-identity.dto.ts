export class UpdatePersonalInfoDto {
  profilePhotoUrl?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  languages?: string;
  phone?: string;
  email?: string;
  currentAddress?: string;
  currentCity?: string;
  postalCode?: string;
  country?: string;
  emergencyContact?: string;
}

export class UpdateHouseholdInfoDto {
  numberOfOccupants?: number;
  adults?: number;
  children?: number;
  hasPets?: boolean;
  petDetails?: string;
  smokingStatus?: 'NON_SMOKER' | 'SMOKER';
  relationshipStatus?: 'SINGLE' | 'COUPLE' | 'FAMILY';
  movingArrangement?: 'ALONE' | 'WITH_PARTNER' | 'WITH_FAMILY' | 'FLATSHARE';
}

export class UpdateEmploymentInfoDto {
  employmentStatus?: 'PERMANENT' | 'TEMPORARY' | 'STUDENT' | 'SELF_EMPLOYED' | 'UNEMPLOYED';
  employer?: string;
  position?: string;
  startDate?: string;
  monthlyNetIncome?: number;
  isConfirmed?: boolean;
  confirmationDocUrl?: string;
}

export class UpdatePreferencesDto {
  preferredCity?: string;
  preferredDistricts?: string;
  maxRent?: number;
  minRooms?: number;
  minArea?: number;
  moveInDate?: string;
  balcony?: boolean;
  parking?: boolean;
  elevator?: boolean;
  furnished?: boolean;
  garden?: boolean;
  petsAllowed?: boolean;
  accessibility?: boolean;
}

export class UpdateRentalHistoryDto {
  currentLandlord?: string;
  previousLandlord?: string;
  currentRent?: number;
  rentalDuration?: string;
  reasonForMoving?: string;
  rentalReferences?: string;
  recommendationDocUrl?: string;
}

export class UpdateGuarantorInfoDto {
  available?: boolean;
  name?: string;
  relationship?: string;
  income?: number;
  supportingDocsUrl?: string;
}

export class UpdateBioDto {
  biography?: string;
  occupationSummary?: string;
}

export class CreateShareLinkDto {
  password?: string;
  maxViews?: number;
  expiresInDays?: number;
  customMessage?: string;
  permissionsJson?: string; // JSON object mapping section/field boolean toggles
}

export class AccessShareLinkDto {
  password?: string;
}
