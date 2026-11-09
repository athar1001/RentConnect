"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieConsentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CookieConsentService = class CookieConsentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig() {
        let config = await this.prisma.cookieConsentConfig.findUnique({
            where: { id: 'default' },
        });
        if (!config) {
            config = await this.prisma.cookieConsentConfig.create({
                data: {
                    id: 'default',
                    policyVersion: 1,
                    enabled: true,
                    titleEn: 'Your Privacy Matters',
                    titleDe: 'Ihre Privatsphäre ist uns wichtig',
                    descriptionEn: 'We use cookies to provide essential functionality and, with your permission, improve WohnBoard through analytics. You can change your preferences at any time.',
                    descriptionDe: 'Wir verwenden Cookies, um die grundlegenden Funktionen bereitzustellen und – mit Ihrer Zustimmung – WohnBoard durch Analysen zu verbessern. Ihre Einstellungen können Sie jederzeit ändern.',
                    privacyPolicyUrl: '/privacy',
                    cookiePolicyUrl: '/cookies',
                    analyticsEnabled: true,
                    functionalEnabled: true,
                },
            });
        }
        return config;
    }
    async updateConfig(dto) {
        await this.getConfig();
        return this.prisma.cookieConsentConfig.update({
            where: { id: 'default' },
            data: {
                policyVersion: Number(dto.policyVersion),
                enabled: Boolean(dto.enabled),
                titleEn: dto.titleEn,
                titleDe: dto.titleDe,
                descriptionEn: dto.descriptionEn,
                descriptionDe: dto.descriptionDe,
                privacyPolicyUrl: dto.privacyPolicyUrl,
                cookiePolicyUrl: dto.cookiePolicyUrl,
                analyticsEnabled: Boolean(dto.analyticsEnabled),
                functionalEnabled: Boolean(dto.functionalEnabled),
            },
        });
    }
};
exports.CookieConsentService = CookieConsentService;
exports.CookieConsentService = CookieConsentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CookieConsentService);
//# sourceMappingURL=cookie-consent.service.js.map