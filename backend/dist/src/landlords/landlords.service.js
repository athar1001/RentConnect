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
exports.LandlordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let LandlordsService = class LandlordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateDefaultLandlord(userId) {
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
    async getProperties(landlordId) {
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
    async createProperty(landlordId, dto) {
        const refNum = `PROP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        return this.prisma.property.create({
            data: {
                landlordId,
                referenceNumber: refNum,
                ...dto,
            },
        });
    }
    async getPropertyById(landlordId, id) {
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
        if (!prop)
            throw new common_1.NotFoundException('Property not found');
        return prop;
    }
    async updateProperty(landlordId, id, dto) {
        const prop = await this.prisma.property.findFirst({ where: { id, landlordId } });
        if (!prop)
            throw new common_1.NotFoundException('Property not found');
        return this.prisma.property.update({
            where: { id },
            data: dto,
        });
    }
    async deleteProperty(landlordId, id) {
        const prop = await this.prisma.property.findFirst({ where: { id, landlordId } });
        if (!prop)
            throw new common_1.NotFoundException('Property not found');
        return this.prisma.property.delete({ where: { id } });
    }
    async getApplications(landlordId, filters) {
        const where = {};
        if (filters.propertyId) {
            where.propertyId = filters.propertyId;
        }
        if (filters.status && filters.status !== 'ALL') {
            where.status = filters.status;
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
        await this.prisma.landlordAuditLog.create({
            data: {
                landlordId,
                action: 'INBOX_VIEWED',
                description: 'Landlord accessed applicant inbox.',
            },
        });
        return apps;
    }
    async getApplicationById(landlordId, applicationId) {
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
        if (!app)
            throw new common_1.NotFoundException('Application not found');
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
        await this.prisma.landlordAuditLog.create({
            data: {
                landlordId,
                applicationId,
                action: 'APPLICANT_PROFILE_VIEWED',
                description: `Landlord inspected applicant profile for application ${app.referenceNumber}.`,
            },
        });
        const allowedFields = JSON.parse(app.sharedProfileFields || '[]');
        const identity = app.user.housingIdentity;
        const filteredProfile = {};
        if (identity) {
            if (allowedFields.includes('personalInfo'))
                filteredProfile.personalInfo = identity.personalInfo;
            if (allowedFields.includes('householdInfo'))
                filteredProfile.householdInfo = identity.householdInfo;
            if (allowedFields.includes('employmentInfo'))
                filteredProfile.employmentInfo = identity.employmentInfo;
            if (allowedFields.includes('preferences'))
                filteredProfile.preferences = identity.preferences;
            if (allowedFields.includes('rentalHistory'))
                filteredProfile.rentalHistory = identity.rentalHistory;
            if (allowedFields.includes('guarantorInfo'))
                filteredProfile.guarantorInfo = identity.guarantorInfo;
        }
        return {
            application: app,
            filteredProfile,
            landlordNotes: notes,
            messages,
        };
    }
    async compareApplicants(landlordId, applicationIds) {
        if (!applicationIds || applicationIds.length === 0) {
            throw new common_1.BadRequestException('Must select at least one application for comparison.');
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
    async scheduleViewing(landlordId, dto) {
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
    async getICSViewing(viewingId) {
        const v = await this.prisma.landlordViewing.findUnique({
            where: { id: viewingId },
            include: { property: true },
        });
        if (!v)
            throw new common_1.NotFoundException('Viewing not found');
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
    async addNote(landlordId, dto, authorName) {
        return this.prisma.landlordApplicantNote.create({
            data: {
                landlordId,
                applicationId: dto.applicationId,
                authorName,
                content: dto.content,
            },
        });
    }
    async sendMessage(dto, senderName) {
        return this.prisma.landlordMessage.create({
            data: {
                applicationId: dto.applicationId,
                senderType: 'LANDLORD',
                senderName,
                content: dto.content,
            },
        });
    }
    async requestDocument(applicationId, requestedType, description) {
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
    async sendOffer(landlordId, applicationId, dto) {
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
    async getAnalytics(landlordId) {
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
    async getAuditLogs(landlordId) {
        return this.prisma.landlordAuditLog.findMany({
            where: { landlordId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
};
exports.LandlordsService = LandlordsService;
exports.LandlordsService = LandlordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LandlordsService);
//# sourceMappingURL=landlords.service.js.map