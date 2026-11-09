import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  CreateApplicationNoteDto,
  CreateApplicationReminderDto,
  CreateApplicationShareDto,
  FulfillRequestDto,
} from './dto/applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async getUserApplications(
    userId: string,
    filters: { status?: string; search?: string; sort?: string }
  ) {
    const where: any = { userId };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as ApplicationStatus;
    }

    if (filters.search) {
      where.OR = [
        { apartment: { title: { contains: filters.search } } },
        { apartment: { address: { contains: filters.search } } },
        { apartment: { city: { contains: filters.search } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort === 'Oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (filters.sort === 'Recently Updated') {
      orderBy = { updatedAt: 'desc' };
    } else if (filters.sort === 'Upcoming Viewing') {
      orderBy = { viewingAt: 'asc' };
      where.viewingAt = { gte: new Date() };
    }

    return this.prisma.application.findMany({
      where,
      orderBy,
      include: {
        apartment: {
          select: {
            title: true,
            rentPrice: true,
            warmRent: true,
            address: true,
            city: true,
            coverImage: true,
          },
        },
        documents: {
          include: {
            document: true,
          },
        },
        sharing: true,
      },
    });
  }

  async getAnalytics(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      include: {
        timeline: true,
      },
    });

    const total = apps.length;
    const sent = apps.filter((a) => ['SENT', 'DELIVERED', 'OPENED', 'DOCUMENTS_VIEWED', 'VIEWING_SCHEDULED', 'VIEWING_COMPLETED', 'WAITING'].includes(a.status)).length;
    const pending = apps.filter((a) => ['DRAFT', 'PREPARED', 'WAITING'].includes(a.status)).length;
    const viewings = apps.filter((a) => ['VIEWING_SCHEDULED', 'VIEWING_COMPLETED'].includes(a.status)).length;
    const offers = apps.filter((a) => ['ACCEPTED', 'VIEWING_COMPLETED'].includes(a.status)).length; // Mock viewing_completed as potential offer
    const rejected = apps.filter((a) => a.status === 'REJECTED').length;
    const withdrawn = apps.filter((a) => a.status === 'WITHDRAWN').length;

    // Response rate calculations
    const respondedApps = apps.filter((a) =>
      ['OPENED', 'DOCUMENTS_VIEWED', 'VIEWING_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(a.status)
    ).length;

    const responseRate = sent > 0 ? Math.round((respondedApps / sent) * 100) : 0;

    return {
      total,
      sent,
      pending,
      viewings,
      offers,
      rejected,
      withdrawn,
      responseRate,
      averageResponseTimeDays: 4, // Mock constant for premium feel
      averageViewingTimeDays: 12,
      averageOfferTimeDays: 20,
    };
  }

  async getApplicationById(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        apartment: true,
        documents: {
          include: {
            document: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        timeline: { orderBy: { createdAt: 'desc' } },
        message: true,
        sharing: true,
        notes: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { dateTime: 'asc' } },
        documentRequests: {
          include: { document: true },
          orderBy: { requestedAt: 'desc' },
        },
        activityLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async createApplication(userId: string, dto: CreateApplicationDto) {
    // Duplicate Protection Check
    const existing = await this.prisma.application.findFirst({
      where: { userId, apartmentId: dto.apartmentId },
    });

    if (existing) {
      throw new BadRequestException({
        error: 'DUPLICATE_APPLICATION',
        message: 'You already applied to this apartment.',
        appliedAt: existing.appliedAt || existing.createdAt,
        status: existing.status,
        applicationId: existing.id,
      });
    }

    const refNum = `WB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create Application transaction
    const app = await this.prisma.application.create({
      data: {
        userId,
        apartmentId: dto.apartmentId,
        status: 'DRAFT',
        referenceNumber: refNum,
        sharedProfileFields: JSON.stringify(dto.sharedProfileFields),
        documents: {
          create: dto.documents.map((docId, index) => ({
            documentId: docId,
            orderIndex: index,
          })),
        },
        message: {
          create: {
            templateName: dto.templateName,
            content: dto.messageContent,
          },
        },
        timeline: {
          create: {
            status: 'DRAFT',
            notes: 'Application draft created.',
          },
        },
      },
      include: {
        apartment: true,
      },
    });

    return app;
  }

  async updateApplication(userId: string, id: string, dto: UpdateApplicationDto) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    const updateData: any = {};
    if (dto.status) {
      updateData.status = dto.status;
      if (dto.status === 'SENT' && !app.appliedAt) {
        updateData.appliedAt = new Date();
      }
    }
    if (dto.viewingAt) {
      updateData.viewingAt = new Date(dto.viewingAt);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: updateData,
    });

    if (dto.status) {
      await this.prisma.applicationTimeline.create({
        data: {
          applicationId: id,
          status: dto.status,
          notes: `Status changed to ${dto.status}.`,
        },
      });

      await this.prisma.applicationActivityLog.create({
        data: {
          applicationId: id,
          action: 'STATUS_CHANGED',
          description: `Application status transitioned to ${dto.status}.`,
        },
      });
    }

    return updated;
  }

  async addNote(userId: string, id: string, dto: CreateApplicationNoteDto) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    return this.prisma.applicationNote.create({
      data: {
        applicationId: id,
        content: dto.content,
      },
    });
  }

  async addReminder(userId: string, id: string, dto: CreateApplicationReminderDto) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    return this.prisma.applicationReminder.create({
      data: {
        applicationId: id,
        title: dto.title,
        description: dto.description,
        dateTime: new Date(dto.dateTime),
      },
    });
  }

  async createSharing(userId: string, id: string, dto: CreateApplicationShareDto) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    const token = crypto.randomBytes(6).toString('hex'); // 12 characters
    let passwordHash: string | null = null;

    if (dto.password && dto.password.trim() !== '') {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    let expiresAt: Date | null = null;
    if (dto.expiresInDays && dto.expiresInDays > 0) {
      expiresAt = new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const sharing = await this.prisma.applicationSharing.upsert({
      where: { applicationId: id },
      create: {
        applicationId: id,
        token,
        passwordHash,
        maxViews: dto.maxViews || null,
        expiresAt,
        allowDownloads: dto.allowDownloads !== false,
        watermarkDocs: dto.watermarkDocs || false,
      },
      update: {
        token,
        passwordHash,
        maxViews: dto.maxViews || null,
        expiresAt,
        allowDownloads: dto.allowDownloads !== false,
        watermarkDocs: dto.watermarkDocs || false,
        revoked: false,
        viewCount: 0,
      },
    });

    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: id,
        action: 'LINK_SHARED',
        description: `Secure application share link created/updated with token ${token}.`,
      },
    });

    return sharing;
  }

  async revokeSharing(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    await this.prisma.applicationSharing.update({
      where: { applicationId: id },
      data: { revoked: true },
    });

    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: id,
        action: 'LINK_REVOKED',
        description: 'Secure application share link revoked.',
      },
    });

    return { success: true };
  }

  async fulfillDocumentRequest(
    userId: string,
    id: string,
    requestId: string,
    dto: FulfillRequestDto
  ) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.documentRequest.update({
      where: { id: requestId },
      data: {
        isFulfilled: true,
        documentId: dto.documentId,
        fulfilledAt: new Date(),
      },
    });

    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: id,
        action: 'DOCUMENT_FULFILLED',
        description: `Requested document (${updated.requestedType}) uploaded and fulfilled.`,
      },
    });

    return updated;
  }

  async withdrawApplication(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    // Update status to WITHDRAWN
    await this.prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: id,
        status: 'WITHDRAWN',
        notes: 'Application withdrawn by applicant.',
      },
    });

    // Revoke share links
    await this.prisma.applicationSharing.updateMany({
      where: { applicationId: id },
      data: { revoked: true },
    });

    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: id,
        action: 'APPLICATION_WITHDRAWN',
        description: 'Application withdrawn and all landlord access link permissions revoked.',
      },
    });

    return { success: true };
  }

  async getPublicApplication(token: string, password?: string) {
    const sharing = await this.prisma.applicationSharing.findUnique({
      where: { token },
      include: {
        application: {
          include: {
            apartment: true,
            user: {
              select: {
                fullName: true,
                email: true,
                housingIdentity: {
                  include: {
                    personalInfo: true,
                    householdInfo: true,
                    employmentInfo: true,
                    preferences: true,
                    rentalHistory: true,
                    guarantorInfo: true,
                  },
                },
              },
            },
            documents: {
              include: {
                document: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
            message: true,
          },
        },
      },
    });

    if (!sharing || sharing.revoked) {
      throw new NotFoundException('Application link is invalid or has been revoked.');
    }

    if (sharing.expiresAt && new Date() > sharing.expiresAt) {
      throw new BadRequestException('This application link has expired.');
    }

    if (sharing.maxViews && sharing.viewCount >= sharing.maxViews) {
      throw new BadRequestException('Maximum view limit reached for this application.');
    }

    if (sharing.passwordHash) {
      if (!password) {
        return { passwordRequired: true, token };
      }
      const isValid = await bcrypt.compare(password, sharing.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Incorrect password for this application link.');
      }
    }

    // Update view count
    await this.prisma.applicationSharing.update({
      where: { id: sharing.id },
      data: { viewCount: { increment: 1 } },
    });

    const app = sharing.application;

    // Automatically transition application status to OPENED if SENT or DELIVERED
    if (app.status === 'SENT' || app.status === 'DELIVERED') {
      await this.prisma.application.update({
        where: { id: app.id },
        data: { status: 'OPENED' },
      });
      await this.prisma.applicationTimeline.create({
        data: {
          applicationId: app.id,
          status: 'OPENED',
          notes: 'Application opened and read by landlord.',
        },
      });
    }

    // Log landlord activity
    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: sharing.applicationId,
        action: 'LANDLORD_VIEWED',
        description: 'Landlord viewed the application package.',
      },
    });

    // Filter Profile Fields according to sharedProfileFields JSON list
    const allowedFields: string[] = JSON.parse(app.sharedProfileFields || '[]');
    const identity = app.user.housingIdentity;

    const filteredProfile: any = {};
    if (identity) {
      if (allowedFields.includes('personalInfo')) filteredProfile.personalInfo = identity.personalInfo;
      if (allowedFields.includes('householdInfo')) filteredProfile.householdInfo = identity.householdInfo;
      if (allowedFields.includes('employmentInfo')) filteredProfile.employmentInfo = identity.employmentInfo;
      if (allowedFields.includes('preferences')) filteredProfile.preferences = identity.preferences;
      if (allowedFields.includes('rentalHistory')) filteredProfile.rentalHistory = identity.rentalHistory;
      if (allowedFields.includes('guarantorInfo')) filteredProfile.guarantorInfo = identity.guarantorInfo;
    }

    return {
      passwordRequired: false,
      apartment: app.apartment,
      applicantName: app.user.fullName || 'Verified WohnBoard Applicant',
      message: app.message,
      profile: filteredProfile,
      documents: app.documents.map((d) => d.document),
      sharingConfig: {
        allowDownloads: sharing.allowDownloads,
        watermarkDocs: sharing.watermarkDocs,
        referenceNumber: app.referenceNumber,
        appliedAt: app.appliedAt || app.createdAt,
      },
    };
  }

  // Admin / Landlord Simulation endpoint to create document requests
  async createDocumentRequest(userId: string, id: string, requestedType: string, description?: string) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    const req = await this.prisma.documentRequest.create({
      data: {
        applicationId: id,
        requestedType,
        description,
      },
    });

    await this.prisma.application.update({
      where: { id },
      data: { status: 'ADDITIONAL_DOCUMENTS_REQUESTED' },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: id,
        status: 'ADDITIONAL_DOCUMENTS_REQUESTED',
        notes: `Landlord requested: ${requestedType}`,
      },
    });

    await this.prisma.applicationActivityLog.create({
      data: {
        applicationId: id,
        action: 'DOCUMENT_REQUESTED',
        description: `Landlord requested additional document: ${requestedType}`,
      },
    });

    return req;
  }

  // --- Timeline Centerpiece & Event Collaboration Methods ---

  async getTimelineFeed(applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        apartment: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
          include: {
            comments: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        documentRequests: {
          include: { document: true },
        },
        offers: {
          orderBy: { createdAt: 'desc' },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) throw new NotFoundException('Application not found');

    const viewings = await this.prisma.landlordViewing.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'desc' },
    });

    return {
      applicationId: app.id,
      status: app.status,
      referenceNumber: app.referenceNumber,
      apartmentTitle: app.apartment.title,
      timeline: app.timeline,
      documentRequests: app.documentRequests,
      viewings,
      offers: app.offers,
      activityLogs: app.activityLogs,
    };
  }

  async addTimelineComment(timelineId: string, senderType: string, senderName: string, content: string) {
    const timeline = await this.prisma.applicationTimeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) throw new NotFoundException('Timeline event not found');

    return this.prisma.timelineComment.create({
      data: {
        timelineId,
        senderType,
        senderName,
        content,
      },
    });
  }

  async respondToViewing(applicationId: string, viewingId: string, action: 'ACCEPT' | 'DECLINE' | 'RESCHEDULE', notes?: string) {
    const viewing = await this.prisma.landlordViewing.findUnique({ where: { id: viewingId } });
    if (!viewing) throw new NotFoundException('Viewing invitation not found');

    let newStatus: any = 'SCHEDULED';
    if (action === 'ACCEPT') newStatus = 'SCHEDULED';
    if (action === 'DECLINE') newStatus = 'CANCELLED';
    if (action === 'RESCHEDULE') newStatus = 'RESCHEDULED';

    await this.prisma.landlordViewing.update({
      where: { id: viewingId },
      data: {
        status: newStatus,
        notes: notes ? `${viewing.notes || ''}\nApplicant RSVP: ${notes}` : viewing.notes,
      },
    });

    const actionText = action === 'ACCEPT' ? 'accepted viewing invitation' : action === 'DECLINE' ? 'declined viewing invitation' : 'requested to reschedule viewing';

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId,
        status: 'VIEWING_SCHEDULED',
        eventType: 'VIEWING_INVITATION',
        actor: 'APPLICANT',
        actorName: 'Applicant',
        notes: `Applicant ${actionText}${notes ? `: ${notes}` : ''}`,
      },
    });

    return { success: true, action };
  }

  async respondToOffer(applicationId: string, offerId: string, action: 'ACCEPT' | 'DECLINE') {
    const offer = await this.prisma.applicationOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');

    const offerStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
    const appStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

    await this.prisma.applicationOffer.update({
      where: { id: offerId },
      data: { status: offerStatus },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: appStatus },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId,
        status: appStatus,
        eventType: 'OFFER',
        actor: 'APPLICANT',
        actorName: 'Applicant',
        notes: `Applicant ${action.toLowerCase()}ed formal lease offer (€${offer.rentPrice}/mo).`,
      },
    });

    return { success: true, status: offerStatus };
  }
}

