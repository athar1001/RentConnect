import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  UpdatePersonalInfoDto,
  UpdateHouseholdInfoDto,
  UpdateEmploymentInfoDto,
  UpdatePreferencesDto,
  UpdateRentalHistoryDto,
  UpdateGuarantorInfoDto,
  UpdateBioDto,
  CreateShareLinkDto,
} from './dto/update-housing-identity.dto';

@Injectable()
export class HousingIdentityService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateIdentity(userId: string) {
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

  async updatePersonalInfo(userId: string, dto: UpdatePersonalInfoDto) {
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

  async updateHouseholdInfo(userId: string, dto: UpdateHouseholdInfoDto) {
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

  async updateEmploymentInfo(userId: string, dto: UpdateEmploymentInfoDto) {
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

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
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

  async updateRentalHistory(userId: string, dto: UpdateRentalHistoryDto) {
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

  async updateGuarantorInfo(userId: string, dto: UpdateGuarantorInfoDto) {
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

  async updateBio(userId: string, dto: UpdateBioDto) {
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

  async createShareLink(userId: string, dto: CreateShareLinkDto) {
    const identity = await this.getOrCreateIdentity(userId);
    const token = crypto.randomBytes(6).toString('hex'); // 12-char unique string

    let passwordHash: string | undefined = undefined;
    if (dto.password && dto.password.trim() !== '') {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    let expiresAt: Date | undefined = undefined;
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

  async getUserShareLinks(userId: string) {
    const identity = await this.getOrCreateIdentity(userId);
    return this.prisma.housingShareLink.findMany({
      where: { identityId: identity.id, revoked: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeShareLink(userId: string, linkId: string) {
    const identity = await this.getOrCreateIdentity(userId);
    const link = await this.prisma.housingShareLink.findFirst({
      where: { id: linkId, identityId: identity.id },
    });

    if (!link) throw new NotFoundException('Share link not found');

    await this.prisma.housingShareLink.update({
      where: { id: linkId },
      data: { revoked: true },
    });

    await this.logAudit(identity.id, 'ACCESS_REVOKED', `Revoked share link (${link.token}).`);
    return { success: true };
  }

  async getPublicProfile(token: string, password?: string) {
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
      throw new NotFoundException('Profile link is invalid or has been revoked.');
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new BadRequestException('This shared profile link has expired.');
    }

    if (link.maxViews && link.viewCount >= link.maxViews) {
      throw new BadRequestException('Maximum view limit reached for this link.');
    }

    if (link.passwordHash) {
      if (!password) {
        return { passwordRequired: true, token };
      }
      const isValid = await bcrypt.compare(password, link.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Incorrect password for this profile link.');
      }
    }

    // Increment view count
    await this.prisma.housingShareLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    });

    // Parse field-level permissions
    let permissions: any = {};
    try {
      permissions = JSON.parse(link.permissionsJson);
    } catch (e) {
      permissions = { personalInfo: true, householdInfo: true, employmentInfo: true, preferences: true, rentalHistory: true, guarantorInfo: true };
    }

    const raw = link.identity;

    // Filter fields based on permissions
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

  private async recalculateScore(identityId: string) {
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

    if (!identity) return;

    let score = 0;

    // Personal Info (25 points)
    if (identity.personalInfo?.firstName && identity.personalInfo?.lastName) score += 10;
    if (identity.personalInfo?.phone && identity.personalInfo?.email) score += 5;
    if (identity.personalInfo?.currentAddress && identity.personalInfo?.currentCity) score += 10;

    // Employment Info (25 points)
    if (identity.employmentInfo?.employer && identity.employmentInfo?.position) score += 15;
    if (identity.employmentInfo?.monthlyNetIncome) score += 10;

    // Household (15 points)
    if (identity.householdInfo?.numberOfOccupants) score += 15;

    // Preferences (15 points)
    if (identity.preferences?.preferredCity && identity.preferences?.maxRent) score += 15;

    // Rental History (10 points)
    if (identity.rentalHistory?.currentLandlord || identity.rentalHistory?.previousLandlord) score += 10;

    // Biography / Introduction (10 points)
    if (identity.biography && identity.biography.trim().length > 10) score += 10;

    const finalScore = Math.min(100, score);

    await this.prisma.housingIdentity.update({
      where: { id: identityId },
      data: { completionScore: finalScore },
    });
  }

  private async logAudit(identityId: string, action: string, description: string) {
    await this.prisma.housingIdentityAuditLog.create({
      data: {
        identityId,
        action,
        description,
      },
    });
  }
}
