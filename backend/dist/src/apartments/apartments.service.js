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
exports.ApartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApartmentsService = class ApartmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createDto) {
        const { notes, images, ...apartmentData } = createDto;
        if (!apartmentData.coverImage && images && images.length > 0) {
            apartmentData.coverImage = images[0];
        }
        const apartment = await this.prisma.apartment.create({
            data: {
                ...apartmentData,
                userId,
                images: images && images.length > 0 ? {
                    create: images.map(url => ({ url }))
                } : undefined,
            },
        });
        if (notes) {
            await this.prisma.communicationLog.create({
                data: {
                    apartmentId: apartment.id,
                    type: 'Note',
                    content: notes,
                },
            });
        }
        return apartment;
    }
    async findAll(userId) {
        return this.prisma.apartment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const apartment = await this.prisma.apartment.findFirst({
            where: { id, userId },
            include: {
                images: true,
                reminders: true,
                logs: true,
                checklists: true,
            },
        });
        if (!apartment) {
            throw new common_1.NotFoundException('Apartment not found');
        }
        return apartment;
    }
    async update(userId, id, updateDto) {
        await this.findOne(userId, id);
        const { notes, images, ...apartmentData } = updateDto;
        return this.prisma.apartment.update({
            where: { id },
            data: apartmentData,
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.apartment.delete({
            where: { id },
        });
    }
    async updateStatus(userId, id, status) {
        await this.findOne(userId, id);
        return this.prisma.apartment.update({
            where: { id },
            data: { status },
        });
    }
    async extensionImport(userId, createDto) {
        let existingApartment = null;
        if (createDto.originalListingUrl) {
            existingApartment = await this.prisma.apartment.findFirst({
                where: {
                    userId,
                    originalListingUrl: createDto.originalListingUrl
                }
            });
        }
        if (!existingApartment && createDto.listingId) {
            existingApartment = await this.prisma.apartment.findFirst({
                where: {
                    userId,
                    listingId: createDto.listingId
                }
            });
        }
        if (existingApartment) {
            await this.prisma.importLog.create({
                data: {
                    url: createDto.originalListingUrl || 'Unknown URL',
                    status: 'FAILED',
                    error: 'This apartment already exists in your account.',
                    platform: createDto.sourcePlatform || 'Unknown',
                    userId,
                    isExtension: true,
                }
            });
            throw new common_1.ConflictException('This apartment already exists in your account.');
        }
        try {
            const rentPrice = createDto.rentPrice !== undefined && createDto.rentPrice !== null ? Number(createDto.rentPrice) : null;
            const warmRent = createDto.warmRent !== undefined && createDto.warmRent !== null ? Number(createDto.warmRent) : null;
            const coldRent = createDto.coldRent !== undefined && createDto.coldRent !== null ? Number(createDto.coldRent) : null;
            const deposit = createDto.deposit !== undefined && createDto.deposit !== null ? Number(createDto.deposit) : null;
            const rooms = createDto.rooms !== undefined && createDto.rooms !== null ? Number(createDto.rooms) : null;
            const squareMeters = createDto.squareMeters !== undefined && createDto.squareMeters !== null ? Number(createDto.squareMeters) : null;
            const furnished = createDto.furnished !== undefined && createDto.furnished !== null ? Boolean(createDto.furnished) : false;
            const petsAllowed = createDto.petsAllowed !== undefined && createDto.petsAllowed !== null ? Boolean(createDto.petsAllowed) : false;
            const moveInDate = createDto.moveInDate ? new Date(createDto.moveInDate) : null;
            const coverImage = createDto.coverImage || (createDto.images && createDto.images.length > 0 ? createDto.images[0] : null);
            const apartment = await this.prisma.apartment.create({
                data: {
                    title: createDto.title || 'Imported Apartment',
                    rentPrice,
                    warmRent,
                    coldRent,
                    deposit,
                    address: createDto.address || null,
                    city: createDto.city || null,
                    zipCode: createDto.zipCode || null,
                    rooms,
                    squareMeters,
                    furnished,
                    petsAllowed,
                    moveInDate,
                    sourcePlatform: createDto.sourcePlatform || 'Unknown',
                    originalListingUrl: createDto.originalListingUrl || null,
                    listingId: createDto.listingId || null,
                    coverImage,
                    status: createDto.status || 'SAVED',
                    userId,
                    energyClass: createDto.energyClass || null,
                    utilityCosts: createDto.utilityCosts !== undefined && createDto.utilityCosts !== null ? Number(createDto.utilityCosts) : null,
                    heatingCostsIncluded: createDto.heatingCostsIncluded !== undefined && createDto.heatingCostsIncluded !== null ? Boolean(createDto.heatingCostsIncluded) : false,
                    heatingCosts: createDto.heatingCosts !== undefined && createDto.heatingCosts !== null ? Number(createDto.heatingCosts) : null,
                    constructionYear: createDto.constructionYear !== undefined && createDto.constructionYear !== null ? Number(createDto.constructionYear) : null,
                    heatingType: createDto.heatingType || null,
                    energySource: createDto.energySource || null,
                    certificateType: createDto.certificateType || null,
                    description: createDto.description || null,
                    availability: createDto.availability || null,
                    floor: createDto.floor || null,
                    images: createDto.images && createDto.images.length > 0 ? {
                        create: createDto.images.map(url => ({ url }))
                    } : undefined,
                }
            });
            await this.prisma.importLog.create({
                data: {
                    url: createDto.originalListingUrl || 'Unknown URL',
                    status: 'SUCCESS',
                    platform: createDto.sourcePlatform || 'Unknown',
                    userId,
                    apartmentId: apartment.id,
                    isExtension: true,
                }
            });
            await this.prisma.user.update({
                where: { id: userId },
                data: { extensionConnected: true }
            });
            return apartment;
        }
        catch (error) {
            if (error.code === 'P2002') {
                await this.prisma.importLog.create({
                    data: {
                        url: createDto.originalListingUrl || 'Unknown URL',
                        status: 'FAILED',
                        error: 'This apartment already exists in your account (unique constraint).',
                        platform: createDto.sourcePlatform || 'Unknown',
                        userId,
                        isExtension: true,
                    }
                });
                throw new common_1.ConflictException('This apartment already exists in your account.');
            }
            await this.prisma.importLog.create({
                data: {
                    url: createDto.originalListingUrl || 'Unknown URL',
                    status: 'FAILED',
                    error: error.message || 'Unknown import error',
                    platform: createDto.sourcePlatform || 'Unknown',
                    userId,
                    isExtension: true,
                }
            });
            throw error;
        }
    }
};
exports.ApartmentsService = ApartmentsService;
exports.ApartmentsService = ApartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApartmentsService);
//# sourceMappingURL=apartments.service.js.map