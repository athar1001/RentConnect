"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingIdentityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
let HousingIdentityService = class HousingIdentityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateIdentity(userId) {
        let identity = await this.prisma.housingIdentity.findUnique({
            where: { userId },
            include: {
                personalInfo: true,
                householdInfo: true,
                employmentInfo: true,
                preferences: true,
                rentalHistory: true,
                guarantorInfo: true,
                shareLinks: {
                    where: { revoked: false },
                    orderBy: { createdAt: 'desc' },
                },
                auditLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                },
            },
        });
        if (!identity) {
            identity = await this.prisma.housingIdentity.create({
                data: {
                    userId,
                    personalInfo: { create: {} },
                    householdInfo: { create: {} },
                    employmentInfo: { create: {} },
                    preferences: { create: {} },
                    rentalHistory: { create: {} },
                    guarantorInfo: { create: {} },
                    auditLogs: {
                        create: {
                            action: 'PROFILE_CREATED',
                            description: 'Housing Identity profile created.',
                        },
                    },
                },
                include: {
                    personalInfo: true,
                    householdInfo: true,
                    employmentInfo: true,
                    preferences: true,
                    rentalHistory: true,
                    guarantorInfo: true,
                    shareLinks: true,
                    auditLogs: true,
                },
            });
            await this.recalculateScore(identity.id);
        }
        return identity;
    }
    async updatePersonalInfo(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        const dob = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
        await this.prisma.housingPersonalInfo.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                dateOfBirth: dob,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'PERSONAL_INFO_UPDATED', 'Updated personal contact information.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updateHouseholdInfo(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        await this.prisma.housingHouseholdInfo.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'HOUSEHOLD_UPDATED', 'Updated household and pet composition.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updateEmploymentInfo(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
        await this.prisma.housingEmploymentInfo.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                startDate,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'EMPLOYMENT_UPDATED', 'Updated employment and income details.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updatePreferences(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        const moveInDate = dto.moveInDate ? new Date(dto.moveInDate) : undefined;
        await this.prisma.housingRentalPreferences.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                moveInDate,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'PREFERENCES_UPDATED', 'Updated rental preferences.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updateRentalHistory(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        await this.prisma.housingRentalHistory.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'RENTAL_HISTORY_UPDATED', 'Updated rental history and landlord contacts.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updateGuarantorInfo(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        await this.prisma.housingGuarantorInfo.update({
            where: { identityId: identity.id },
            data: {
                ...dto,
                verificationStatus: 'COMPLETED',
            },
        });
        await this.logAudit(identity.id, 'GUARANTOR_UPDATED', 'Updated guarantor details.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async updateBio(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        await this.prisma.housingIdentity.update({
            where: { id: identity.id },
            data: {
                biography: dto.biography,
                occupationSummary: dto.occupationSummary,
            },
        });
        await this.logAudit(identity.id, 'BIO_UPDATED', 'Updated introduction biography.');
        await this.recalculateScore(identity.id);
        return this.getOrCreateIdentity(userId);
    }
    async createShareLink(userId, dto) {
        const identity = await this.getOrCreateIdentity(userId);
        const token = crypto.randomBytes(6).toString('hex');
        let passwordHash = undefined;
        if (dto.password && dto.password.trim() !== '') {
            passwordHash = await bcrypt.hash(dto.password, 10);
        }
        let expiresAt = undefined;
        if (dto.expiresInDays && dto.expiresInDays > 0) {
            expiresAt = new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000);
        }
        const shareLink = await this.prisma.housingShareLink.create({
            data: {
                identityId: identity.id,
                token,
                passwordHash,
                maxViews: dto.maxViews || null,
                expiresAt,
                customMessage: dto.customMessage,
                permissionsJson: dto.permissionsJson || JSON.stringify({
                    personalInfo: true,
                    householdInfo: true,
                    employmentInfo: true,
                    preferences: true,
                    rentalHistory: true,
                    guarantorInfo: true,
                    documents: true,
                }),
            },
        });
        await this.logAudit(identity.id, 'PROFILE_SHARED', `Created share link (${token}).`);
        return shareLink;
    }
    async getUserShareLinks(userId) {
        const identity = await this.getOrCreateIdentity(userId);
        return this.prisma.housingShareLink.findMany({
            where: { identityId: identity.id, revoked: false },
            orderBy: { createdAt: 'desc' },
        });
    }
    async revokeShareLink(userId, linkId) {
        const identity = await this.getOrCreateIdentity(userId);
        const link = await this.prisma.housingShareLink.findFirst({
            where: { id: linkId, identityId: identity.id },
        });
        if (!link)
            throw new common_1.NotFoundException('Share link not found');
        await this.prisma.housingShareLink.update({
            where: { id: linkId },
            data: { revoked: true },
        });
        await this.logAudit(identity.id, 'ACCESS_REVOKED', `Revoked share link (${link.token}).`);
        return { success: true };
    }
    async getPublicProfile(token, password) {
        const link = await this.prisma.housingShareLink.findUnique({
            where: { token },
            include: {
                identity: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                preferredCity: true,
                            },
                        },
                        personalInfo: true,
                        householdInfo: true,
                        employmentInfo: true,
                        preferences: true,
                        rentalHistory: true,
                        guarantorInfo: true,
                    },
                },
            },
        });
        if (!link || link.revoked) {
            throw new common_1.NotFoundException('Profile link is invalid or has been revoked.');
        }
        if (link.expiresAt && new Date() > link.expiresAt) {
            throw new common_1.BadRequestException('This shared profile link has expired.');
        }
        if (link.maxViews && link.viewCount >= link.maxViews) {
            throw new common_1.BadRequestException('Maximum view limit reached for this link.');
        }
        if (link.passwordHash) {
            if (!password) {
                return { passwordRequired: true, token };
            }
            const isValid = await bcrypt.compare(password, link.passwordHash);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Incorrect password for this profile link.');
            }
        }
        await this.prisma.housingShareLink.update({
            where: { id: link.id },
            data: { viewCount: { increment: 1 } },
        });
        let permissions = {};
        try {
            permissions = JSON.parse(link.permissionsJson);
        }
        catch (e) {
            permissions = { personalInfo: true, householdInfo: true, employmentInfo: true, preferences: true, rentalHistory: true, guarantorInfo: true };
        }
        const raw = link.identity;
        const filteredProfile = {
            user: raw.user,
            completionScore: raw.completionScore,
            biography: permissions.personalInfo !== false ? raw.biography : null,
            occupationSummary: permissions.employmentInfo !== false ? raw.occupationSummary : null,
            personalInfo: permissions.personalInfo !== false ? raw.personalInfo : null,
            householdInfo: permissions.householdInfo !== false ? raw.householdInfo : null,
            employmentInfo: permissions.employmentInfo !== false ? raw.employmentInfo : null,
            preferences: permissions.preferences !== false ? raw.preferences : null,
            rentalHistory: permissions.rentalHistory !== false ? raw.rentalHistory : null,
            guarantorInfo: permissions.guarantorInfo !== false ? raw.guarantorInfo : null,
            customMessage: link.customMessage,
        };
        return { passwordRequired: false, profile: filteredProfile };
    }
    async recalculateScore(identityId) {
        const identity = await this.prisma.housingIdentity.findUnique({
            where: { id: identityId },
            include: {
                personalInfo: true,
                householdInfo: true,
                employmentInfo: true,
                preferences: true,
                rentalHistory: true,
                guarantorInfo: true,
            },
        });
        if (!identity)
            return;
        let score = 0;
        if (identity.personalInfo?.firstName && identity.personalInfo?.lastName)
            score += 10;
        if (identity.personalInfo?.phone && identity.personalInfo?.email)
            score += 5;
        if (identity.personalInfo?.currentAddress && identity.personalInfo?.currentCity)
            score += 10;
        if (identity.employmentInfo?.employer && identity.employmentInfo?.position)
            score += 15;
        if (identity.employmentInfo?.monthlyNetIncome)
            score += 10;
        if (identity.householdInfo?.numberOfOccupants)
            score += 15;
        if (identity.preferences?.preferredCity && identity.preferences?.maxRent)
            score += 15;
        if (identity.rentalHistory?.currentLandlord || identity.rentalHistory?.previousLandlord)
            score += 10;
        if (identity.biography && identity.biography.trim().length > 10)
            score += 10;
        const finalScore = Math.min(100, score);
        await this.prisma.housingIdentity.update({
            where: { id: identityId },
            data: { completionScore: finalScore },
        });
    }
    async logAudit(identityId, action, description) {
        await this.prisma.housingIdentityAuditLog.create({
            data: {
                identityId,
                action,
                description,
            },
        });
    }
};
exports.HousingIdentityService = HousingIdentityService;
exports.HousingIdentityService = HousingIdentityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HousingIdentityService);
//# sourceMappingURL=housing-identity.service.js.map