import { PrismaService } from '../prisma/prisma.service';
import { UpdateCookieConsentDto } from './dto/cookie-consent.dto';
export declare class CookieConsentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
