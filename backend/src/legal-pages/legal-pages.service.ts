import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LegalPageType, LegalPageStatus } from '@prisma/client';
import { UpdateLegalPageDto, PublishLegalPageDto } from './dto/legal-page.dto';

@Injectable()
export class LegalPagesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seedDefaultPages();
    } catch (err: any) {
      // Ignored if DB is offline
    }
  }

  async seedDefaultPages() {
    const legalPages = [
      {
        pageType: LegalPageType.PRIVACY_POLICY,
        titleEn: 'Privacy Policy',
        slugEn: 'privacy-policy',
        contentEn: '# Privacy Policy\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Privacy Policy content...',
        titleDe: 'Datenschutzerklärung',
        slugDe: 'datenschutzerklaerung',
        contentDe: '# Datenschutzerklärung\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Datenschutzerklärung...',
      },
      {
        pageType: LegalPageType.TERMS_OF_SERVICE,
        titleEn: 'Terms of Service',
        slugEn: 'terms-of-service',
        contentEn: '# Terms of Service\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Terms of Service content...',
        titleDe: 'Nutzungsbedingungen',
        slugDe: 'nutzungsbedingungen',
        contentDe: '# Nutzungsbedingungen\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Nutzungsbedingungen...',
      },
      {
        pageType: LegalPageType.COOKIE_POLICY,
        titleEn: 'Cookie Policy',
        slugEn: 'cookie-policy',
        contentEn: '# Cookie Policy\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Cookie Policy content...',
        titleDe: 'Cookie-Richtlinie',
        slugDe: 'cookie-richtlinie',
        contentDe: '# Cookie-Richtlinie\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Cookie-Richtlinie...',
      },
      {
        pageType: LegalPageType.IMPRINT,
        titleEn: 'Imprint',
        slugEn: 'imprint',
        contentEn: '# Imprint\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Imprint content...',
        titleDe: 'Impressum',
        slugDe: 'impressum',
        contentDe: '# Impressum\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Impressum...',
      },
    ];

    for (const page of legalPages) {
      await this.prisma.legalPage.upsert({
        where: { pageType: page.pageType },
        update: {},
        create: {
          pageType: page.pageType,
          status: LegalPageStatus.DRAFT,
          titleEn: page.titleEn,
          slugEn: page.slugEn,
          contentEn: page.contentEn,
          titleDe: page.titleDe,
          slugDe: page.slugDe,
          contentDe: page.contentDe,
          noIndex: true,
        },
      });
    }
  }

  // --- Public Endpoints ---

  async getPublishedStatus() {
    const pages = await this.prisma.legalPage.findMany({
      select: {
        pageType: true,
        status: true,
      },
    });

    const statusMap = {
      PRIVACY_POLICY: false,
      TERMS_OF_SERVICE: false,
      COOKIE_POLICY: false,
      IMPRINT: false,
    };

    pages.forEach((page) => {
      if (page.status === LegalPageStatus.PUBLISHED) {
        statusMap[page.pageType] = true;
      }
    });

    return statusMap;
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.legalPage.findFirst({
      where: {
        OR: [
          { slugEn: slug },
          { slugDe: slug },
        ],
      },
    });

    if (!page) {
      throw new NotFoundException('Legal page not found');
    }

    if (page.status !== LegalPageStatus.PUBLISHED) {
      throw new NotFoundException('Legal page is not published');
    }

    return page;
  }

  async findByType(type: LegalPageType) {
    const page = await this.prisma.legalPage.findUnique({
      where: { pageType: type },
    });

    if (!page) {
      throw new NotFoundException('Legal page not found');
    }

    if (page.status !== LegalPageStatus.PUBLISHED) {
      throw new NotFoundException('Legal page is not published');
    }

    return page;
  }

  // --- Admin Endpoints (Protected) ---

  async findAllAdmin() {
    return this.prisma.legalPage.findMany({
      orderBy: { pageType: 'asc' },
    });
  }

  async findOneAdmin(id: string) {
    const page = await this.prisma.legalPage.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Legal page not found');
    }

    return page;
  }

  async update(id: string, dto: UpdateLegalPageDto, adminId: string, ipAddress?: string) {
    const existing = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Legal page not found');
    }

    const updated = await this.prisma.legalPage.update({
      where: { id },
      data: {
        status: dto.status,
        noIndex: dto.noIndex,
        titleEn: dto.titleEn,
        slugEn: dto.slugEn,
        contentEn: dto.contentEn,
        seoTitleEn: dto.seoTitleEn,
        seoDescriptionEn: dto.seoDescriptionEn,
        titleDe: dto.titleDe,
        slugDe: dto.slugDe,
        contentDe: dto.contentDe,
        seoTitleDe: dto.seoTitleDe,
        seoDescriptionDe: dto.seoDescriptionDe,
      },
    });

    // If they updated to ARCHIVED status, we log it
    const action = dto.status === LegalPageStatus.ARCHIVED ? 'ARCHIVE_LEGAL_PAGE' : 'UPDATE_LEGAL_PAGE';
    await this.logAudit(adminId, action, existing.pageType, ipAddress);

    return updated;
  }

  async publish(id: string, dto: PublishLegalPageDto, adminId: string, adminEmail: string, ipAddress?: string) {
    const existing = await this.prisma.legalPage.findUnique({
      where: { id },
      include: { versions: { select: { versionNumber: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Legal page not found');
    }

    // Validate English and German title and content exist
    if (!existing.titleEn?.trim() || !existing.contentEn?.trim() || !existing.titleDe?.trim() || !existing.contentDe?.trim()) {
      throw new BadRequestException('English and German titles and contents are required to publish');
    }

    // Determine the next version number
    const maxVersion = existing.versions.reduce((max, v) => (v.versionNumber > max ? v.versionNumber : max), 0);
    const nextVersionNumber = maxVersion + 1;

    // Create a transaction: create version snapshot and update active page status/timestamps
    const [version, page] = await this.prisma.$transaction([
      this.prisma.legalPageVersion.create({
        data: {
          pageId: id,
          versionNumber: nextVersionNumber,
          titleEn: existing.titleEn,
          contentEn: existing.contentEn,
          titleDe: existing.titleDe,
          contentDe: existing.contentDe,
          publishedBy: adminEmail,
          changeNote: dto.changeNote || `Published Version ${nextVersionNumber}`,
        },
      }),
      this.prisma.legalPage.update({
        where: { id },
        data: {
          status: LegalPageStatus.PUBLISHED,
          publishedAt: new Date(),
          lastReviewedAt: new Date(),
        },
      }),
    ]);

    await this.logAudit(adminId, 'PUBLISH_LEGAL_PAGE', existing.pageType, ipAddress);

    return { version, page };
  }

  async unpublish(id: string, adminId: string, ipAddress?: string) {
    const existing = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Legal page not found');
    }

    const updated = await this.prisma.legalPage.update({
      where: { id },
      data: {
        status: LegalPageStatus.DRAFT,
      },
    });

    await this.logAudit(adminId, 'UNPUBLISH_LEGAL_PAGE', existing.pageType, ipAddress);

    return updated;
  }

  async getVersions(id: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Legal page not found');
    }
    return this.prisma.legalPageVersion.findMany({
      where: { pageId: id },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async restore(id: string, versionId: string, adminId: string, ipAddress?: string) {
    const page = await this.prisma.legalPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException('Legal page not found');
    }

    const version = await this.prisma.legalPageVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.pageId !== id) {
      throw new BadRequestException('Invalid version snapshot for this legal page');
    }

    // Restore contents back into the active page. Keep status as DRAFT or current status
    const restored = await this.prisma.legalPage.update({
      where: { id },
      data: {
        titleEn: version.titleEn,
        contentEn: version.contentEn,
        titleDe: version.titleDe,
        contentDe: version.contentDe,
        status: LegalPageStatus.DRAFT, // Restore as Draft to allow review before publishing
      },
    });

    await this.logAudit(adminId, 'RESTORE_LEGAL_PAGE_VERSION', page.pageType, ipAddress);

    return restored;
  }

  // --- Helper Methods ---

  private async logAudit(adminId: string, action: string, pageType: string, ipAddress?: string) {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetEntity: `LEGAL_PAGE:${pageType}`,
        ipAddress: ipAddress || null,
      },
    });
  }
}
