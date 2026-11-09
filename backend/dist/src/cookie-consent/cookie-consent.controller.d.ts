import { CookieConsentService } from './cookie-consent.service';
import { UpdateCookieConsentDto } from './dto/cookie-consent.dto';
export declare class CookieConsentController {
    private readonly cookieConsentService;
    constructor(cookieConsentService: CookieConsentService);
    getConfig(): Promise<{
        id: string;
        updatedAt: Date;
        policyVersion: number;
        enabled: boolean;
        titleEn: string;
        titleDe: string;
        descriptionEn: string;
        descriptionDe: string;
        privacyPolicyUrl: string;
        cookiePolicyUrl: string;
        analyticsEnabled: boolean;
        functionalEnabled: boolean;
    }>;
    updateConfig(dto: UpdateCookieConsentDto): Promise<{
        id: string;
        updatedAt: Date;
        policyVersion: number;
        enabled: boolean;
        titleEn: string;
        titleDe: string;
        descriptionEn: string;
        descriptionDe: string;
        privacyPolicyUrl: string;
        cookiePolicyUrl: string;
        analyticsEnabled: boolean;
        functionalEnabled: boolean;
    }>;
}
