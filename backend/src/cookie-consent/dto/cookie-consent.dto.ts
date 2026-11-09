export class UpdateCookieConsentDto {
  policyVersion!: number;
  enabled!: boolean;
  titleEn!: string;
  titleDe!: string;
  descriptionEn!: string;
  descriptionDe!: string;
  privacyPolicyUrl!: string;
  cookiePolicyUrl!: string;
  analyticsEnabled!: boolean;
  functionalEnabled!: boolean;
}
