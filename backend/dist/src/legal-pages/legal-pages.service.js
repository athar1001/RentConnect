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
exports.LegalPagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LegalPagesService = class LegalPagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.seedDefaultPages();
        }
        catch (err) {
        }
    }
    async seedDefaultPages() {
        const legalPages = [
            {
                pageType: client_1.LegalPageType.PRIVACY_POLICY,
                titleEn: 'Privacy Policy',
                slugEn: 'privacy-policy',
                contentEn: '# Privacy Policy\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Privacy Policy content...',
                titleDe: 'Datenschutzerklärung',
                slugDe: 'datenschutzerklaerung',
                contentDe: '# Datenschutzerklärung\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Datenschutzerklärung...',
            },
            {
                pageType: client_1.LegalPageType.TERMS_OF_SERVICE,
                titleEn: 'Terms of Service',
                slugEn: 'terms-of-service',
                contentEn: '# Terms of Service\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Terms of Service content...',
                titleDe: 'Nutzungsbedingungen',
                slugDe: 'nutzungsbedingungen',
                contentDe: '# Nutzungsbedingungen\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Nutzungsbedingungen...',
            },
            {
                pageType: client_1.LegalPageType.COOKIE_POLICY,
                titleEn: 'Cookie Policy',
                slugEn: 'cookie-policy',
                contentEn: '# Cookie Policy\n\nLast updated: {{lastUpdated}}\n\n## 1. Introduction\n\nDraft Cookie Policy content...',
                titleDe: 'Cookie-Richtlinie',
                slugDe: 'cookie-richtlinie',
                contentDe: '# Cookie-Richtlinie\n\nZuletzt aktualisiert: {{lastUpdated}}\n\n## 1. Einleitung\n\nEntwurf Cookie-Richtlinie...',
            },
            {
                pageType: client_1.LegalPageType.IMPRINT,
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
                    status: client_1.LegalPageStatus.DRAFT,
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
            if (page.status === client_1.LegalPageStatus.PUBLISHED) {
                statusMap[page.pageType] = true;
            }
        });
        return statusMap;
    }
    async findBySlug(slug) {
        const page = await this.prisma.legalPage.findFirst({
            where: {
                OR: [
                    { slugEn: slug },
                    { slugDe: slug },
                ],
            },
        });
        if (!page) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        if (page.status !== client_1.LegalPageStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Legal page is not published');
        }
        return page;
    }
    async findByType(type) {
        const page = await this.prisma.legalPage.findUnique({
            where: { pageType: type },
        });
        if (!page) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        if (page.status !== client_1.LegalPageStatus.PUBLISHED) {
            throw new common_1.NotFoundException('Legal page is not published');
        }
        return page;
    }
    async findAllAdmin() {
        return this.prisma.legalPage.findMany({
            orderBy: { pageType: 'asc' },
        });
    }
    async findOneAdmin(id) {
        const page = await this.prisma.legalPage.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: { versionNumber: 'desc' },
                },
            },
        });
        if (!page) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        return page;
    }
    async update(id, dto, adminId, ipAddress) {
        const existing = await this.prisma.legalPage.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Legal page not found');
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
        const action = dto.status === client_1.LegalPageStatus.ARCHIVED ? 'ARCHIVE_LEGAL_PAGE' : 'UPDATE_LEGAL_PAGE';
        await this.logAudit(adminId, action, existing.pageType, ipAddress);
        return updated;
    }
    async publish(id, dto, adminId, adminEmail, ipAddress) {
        const existing = await this.prisma.legalPage.findUnique({
            where: { id },
            include: { versions: { select: { versionNumber: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        if (!existing.titleEn?.trim() || !existing.contentEn?.trim() || !existing.titleDe?.trim() || !existing.contentDe?.trim()) {
            throw new common_1.BadRequestException('English and German titles and contents are required to publish');
        }
        const maxVersion = existing.versions.reduce((max, v) => (v.versionNumber > max ? v.versionNumber : max), 0);
        const nextVersionNumber = maxVersion + 1;
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
                    status: client_1.LegalPageStatus.PUBLISHED,
                    publishedAt: new Date(),
                    lastReviewedAt: new Date(),
                },
            }),
        ]);
        await this.logAudit(adminId, 'PUBLISH_LEGAL_PAGE', existing.pageType, ipAddress);
        return { version, page };
    }
    async unpublish(id, adminId, ipAddress) {
        const existing = await this.prisma.legalPage.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        const updated = await this.prisma.legalPage.update({
            where: { id },
            data: {
                status: client_1.LegalPageStatus.DRAFT,
            },
        });
        await this.logAudit(adminId, 'UNPUBLISH_LEGAL_PAGE', existing.pageType, ipAddress);
        return updated;
    }
    async getVersions(id) {
        const page = await this.prisma.legalPage.findUnique({ where: { id } });
        if (!page) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        return this.prisma.legalPageVersion.findMany({
            where: { pageId: id },
            orderBy: { versionNumber: 'desc' },
        });
    }
    async restore(id, versionId, adminId, ipAddress) {
        const page = await this.prisma.legalPage.findUnique({ where: { id } });
        if (!page) {
            throw new common_1.NotFoundException('Legal page not found');
        }
        const version = await this.prisma.legalPageVersion.findUnique({
            where: { id: versionId },
        });
        if (!version || version.pageId !== id) {
            throw new common_1.BadRequestException('Invalid version snapshot for this legal page');
        }
        const restored = await this.prisma.legalPage.update({
            where: { id },
            data: {
                titleEn: version.titleEn,
                contentEn: version.contentEn,
                titleDe: version.titleDe,
                contentDe: version.contentDe,
                status: client_1.LegalPageStatus.DRAFT,
            },
        });
        await this.logAudit(adminId, 'RESTORE_LEGAL_PAGE_VERSION', page.pageType, ipAddress);
        return restored;
    }
    async logAudit(adminId, action, pageType, ipAddress) {
        await this.prisma.adminAuditLog.create({
            data: {
                adminId,
                action,
                targetEntity: `LEGAL_PAGE:${pageType}`,
                ipAddress: ipAddress || null,
            },
        });
    }
};
exports.LegalPagesService = LegalPagesService;
exports.LegalPagesService = LegalPagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LegalPagesService);
//# sourceMappingURL=legal-pages.service.js.map