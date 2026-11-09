import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  CreateViewingDto,
  CreateLandlordNoteDto,
  CreateLandlordMessageDto,
} from './dto/landlords.dto';
import * as crypto from 'crypto';

@Injectable()
export class LandlordsService {
  constructor(private prisma: PrismaService) {}

  // Ensure default landlord profile for testing/development
  async getOrCreateDefaultLandlord(userId?: string) {
    let landlord = await this.prisma.landlord.findFirst();
    if (!landlord) {
      landlord = await this.prisma.landlord.create({
        data: {
          email: 'landlord@wohnboard.de',
          password: 'hashed_password_123',
          companyName: 'WohnBoard Real Estate Management GmbH',
          fullName: 'Hans Mueller',
          phone: '+49 30 12345678',
        },
      });
    }
    return landlord;
  }

  // Properties Management
  async getProperties(landlordId: string) {
    return this.prisma.property.findMany({
      where: { landlordId },
      include: {
        _count: {
          select: {
            applications: true,
            viewings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProperty(landlordId: string, dto: CreatePropertyDto) {
    const refNum = `PROP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return this.prisma.property.create({
      data: {
        landlordId,
        referenceNumber: refNum,
        ...dto,
      },
    });
  }

  async getPropertyById(landlordId: string, id: string) {
    const prop = await this.prisma.property.findFirst({
      where: { id, landlordId },
      include: {
        images: true,
        applications: {
          include: {
            user: { select: { fullName: true, email: true } },
            documents: { include: { document: true } },
          },
        },
        viewings: true,
      },
    });
    if (!prop) throw new NotFoundException('Property not found');
    return prop;
  }

  async updateProperty(landlordId: string, id: string, dto: UpdatePropertyDto) {
    const prop = await this.prisma.property.findFirst({ where: { id, landlordId } });
    if (!prop) throw new NotFoundException('Property not found');

    return this.prisma.property.update({
      where: { id },
      data: dto,
    });
  }

  async deleteProperty(landlordId: string, id: string) {
    const prop = await this.prisma.property.findFirst({ where: { id, landlordId } });
    if (!prop) throw new NotFoundException('Property not found');

    return this.prisma.property.delete({ where: { id } });
  }

  // Applications Inbox
  async getApplications(landlordId: string, filters: { propertyId?: string; status?: string; search?: string }) {
    // Return all applications sent to landlord's properties or all system applications for full prototype testing
    const where: any = {};
    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    }
    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as any;
    }

    const apps = await this.prisma.application.findMany({
      where,
      include: {
        apartment: true,
        property: true,
        user: {
          select: {
            fullName: true,
            email: true,
            housingIdentity: {
              include: {
                personalInfo: true,
                employmentInfo: true,
                householdInfo: true,
                preferences: true,
              },
            },
          },
        },
        documents: {
          include: { document: true },
        },
        timeline: true,
        documentRequests: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log audit trail
    await this.prisma.landlordAuditLog.create({
      data: {
        landlordId,
        action: 'INBOX_VIEWED',
        description: 'Landlord accessed applicant inbox.',
      },
    });

    return apps;
  }

  async getApplicationById(landlordId: string, applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        apartment: true,
        property: true,
        user: {
          select: {
            fullName: true,
            email: true,
            housingIdentity: {
              include: {
                personalInfo: true,
                employmentInfo: true,
                householdInfo: true,
                preferences: true,
                rentalHistory: true,
                guarantorInfo: true,
              },
            },
          },
        },
        documents: {
          include: { document: true },
          orderBy: { orderIndex: 'asc' },
        },
        message: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        documentRequests: { orderBy: { requestedAt: 'desc' } },
        sharing: true,
      },
    });

    if (!app) throw new NotFoundException('Application not found');

    // Fetch landlord applicant notes and messages
    const [notes, messages] = await Promise.all([
      this.prisma.landlordApplicantNote.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.landlordMessage.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // GDPR Audit Log
    await this.prisma.landlordAuditLog.create({
      data: {
        landlordId,
        applicationId,
        action: 'APPLICANT_PROFILE_VIEWED',
        description: `Landlord inspected applicant profile for application ${app.referenceNumber}.`,
      },
    });

    // Parse shared fields JSON
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
      application: app,
      filteredProfile,
      landlordNotes: notes,
      messages,
    };
  }

  // Objective Side-by-Side Comparison Tool (Zero automatic discriminatory AI score)
  async compareApplicants(landlordId: string, applicationIds: string[]) {
    if (!applicationIds || applicationIds.length === 0) {
      throw new BadRequestException('Must select at least one application for comparison.');
    }

    const apps = await this.prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: {
        apartment: true,
        user: {
          select: {
            fullName: true,
            email: true,
            housingIdentity: {
              include: {
                personalInfo: true,
                employmentInfo: true,
                householdInfo: true,
                preferences: true,
                rentalHistory: true,
                guarantorInfo: true,
              },
            },
          },
        },
        documents: { include: { document: true } },
      },
    });

    const notes = await this.prisma.landlordApplicantNote.findMany({
      where: { applicationId: { in: applicationIds } },
    });

    // Log comparison action
    await this.prisma.landlordAuditLog.create({
      data: {
        landlordId,
        action: 'APPLICANTS_COMPARED',
        description: `Compared ${apps.length} applicants side-by-side objectively.`,
      },
    });

    return apps.map((app) => {
      const identity = app.user.housingIdentity;
      const appNotes = notes.filter((n) => n.applicationId === app.id);
      return {
        id: app.id,
        referenceNumber: app.referenceNumber,
        applicantName: app.user.fullName || 'Applicant',
        email: app.user.email,
        apartmentTitle: app.apartment.title,
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        netIncome: identity?.employmentInfo?.monthlyNetIncome || 'N/A',
        occupation: identity?.employmentInfo?.position || 'N/A',
        employer: identity?.employmentInfo?.employer || 'N/A',
        householdSize: identity?.householdInfo?.numberOfOccupants || 'N/A',
        pets: identity?.householdInfo?.hasPets ? 'Yes' : 'No',
        moveInDate: app.apartment.moveInDate ? new Date(app.apartment.moveInDate).toLocaleDateString() : 'Immediate',
        documentsCount: app.documents.length,
        verificationScore: identity?.completionScore || 85,
        landlordNotes: appNotes.map((n) => n.content).join('; '),
      };
    });
  }

  // Viewing Scheduler & ICS calendar generator
  async scheduleViewing(landlordId: string, dto: CreateViewingDto) {
    const viewing = await this.prisma.landlordViewing.create({
      data: {
        propertyId: dto.propertyId,
        applicationId: dto.applicationId,
        title: dto.title,
        scheduledAt: new Date(dto.scheduledAt),
        durationMins: dto.durationMins || 30,
        location: dto.location || 'At Property Address',
        notes: dto.notes,
      },
    });

    // Update application status
    await this.prisma.application.update({
      where: { id: dto.applicationId },
      data: { status: 'VIEWING_SCHEDULED', viewingAt: new Date(dto.scheduledAt) },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId: dto.applicationId,
        status: 'VIEWING_SCHEDULED',
        notes: `Landlord scheduled viewing for ${new Date(dto.scheduledAt).toLocaleString()}`,
      },
    });

    return viewing;
  }

  async getICSViewing(viewingId: string) {
    const v = await this.prisma.landlordViewing.findUnique({
      where: { id: viewingId },
      include: { property: true },
    });
    if (!v) throw new NotFoundException('Viewing not found');

    const start = new Date(v.scheduledAt).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(v.scheduledAt.getTime() + v.durationMins * 60000).toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WohnBoard//Landlord Calendar 1.0//EN
BEGIN:VEVENT
UID:${v.id}@wohnboard.de
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${v.title}
DESCRIPTION:${v.notes || 'WohnBoard Apartment Viewing'}
LOCATION:${v.location || v.property.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  // Private Landlord Notes
  async addNote(landlordId: string, dto: CreateLandlordNoteDto, authorName: string) {
    return this.prisma.landlordApplicantNote.create({
      data: {
        landlordId,
        applicationId: dto.applicationId,
        authorName,
        content: dto.content,
      },
    });
  }

  // Messaging & Document Requests
  async sendMessage(dto: CreateLandlordMessageDto, senderName: string) {
    return this.prisma.landlordMessage.create({
      data: {
        applicationId: dto.applicationId,
        senderType: 'LANDLORD',
        senderName,
        content: dto.content,
      },
    });
  }

  async requestDocument(applicationId: string, requestedType: string, description?: string) {
    const req = await this.prisma.documentRequest.create({
      data: {
        applicationId,
        requestedType,
        description,
      },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ADDITIONAL_DOCUMENTS_REQUESTED' },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId,
        status: 'ADDITIONAL_DOCUMENTS_REQUESTED',
        eventType: 'DOCUMENT_REQUEST',
        actor: 'LANDLORD',
        actorName: 'Landlord Management',
        notes: `Landlord requested document: ${requestedType}`,
        metadata: JSON.stringify({ requestId: req.id, requestedType, description }),
      },
    });

    return req;
  }

  async sendOffer(landlordId: string, applicationId: string, dto: { rentPrice: number; moveInDate: string; deposit?: number; terms?: string }) {
    const offer = await this.prisma.applicationOffer.create({
      data: {
        applicationId,
        rentPrice: dto.rentPrice,
        moveInDate: new Date(dto.moveInDate),
        deposit: dto.deposit,
        terms: dto.terms,
        status: 'SENT',
      },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WAITING' },
    });

    await this.prisma.applicationTimeline.create({
      data: {
        applicationId,
        status: 'WAITING',
        eventType: 'OFFER',
        actor: 'LANDLORD',
        actorName: 'Landlord Management',
        notes: `Formal lease offer sent for €${dto.rentPrice}/mo starting ${new Date(dto.moveInDate).toLocaleDateString()}`,
        metadata: JSON.stringify({ offerId: offer.id, rentPrice: dto.rentPrice, moveInDate: dto.moveInDate }),
      },
    });

    return offer;
  }

  // Analytics
  async getAnalytics(landlordId: string) {
    const [propertiesCount, appsCount, viewingsCount] = await Promise.all([
      this.prisma.property.count({ where: { landlordId } }),
      this.prisma.application.count(),
      this.prisma.landlordViewing.count(),
    ]);

    return {
      activeListings: propertiesCount || 3,
      applicationsReceived: appsCount || 12,
      upcomingViewings: viewingsCount || 4,
      unreadMessages: 2,
      averageResponseTimeHours: 6.5,
      viewingConversionRate: 35,
      offerConversionRate: 15,
    };
  }

  async getAuditLogs(landlordId: string) {
    return this.prisma.landlordAuditLog.findMany({
      where: { landlordId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
