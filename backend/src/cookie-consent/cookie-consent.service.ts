import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCookieConsentDto } from './dto/cookie-consent.dto';

@Injectable()
export class CookieConsentService {
  constructor(private readonly prisma: PrismaService) {}

  // Get or seed the default cookie consent config
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

  // Update configuration
  async updateConfig(dto: UpdateCookieConsentDto) {
    // Make sure config exists first
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
}
