import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { ApartmentStatus } from '@prisma/client';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateApartmentDto) {
    const { notes, images, ...apartmentData } = createDto;
    
    // Set coverImage to the first uploaded image if not provided
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

  async findAll(userId: string) {
    return this.prisma.apartment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
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
      throw new NotFoundException('Apartment not found');
    }

    return apartment;
  }

  async update(userId: string, id: string, updateDto: UpdateApartmentDto) {
    await this.findOne(userId, id); // Ensure it exists and belongs to user

    const { notes, images, ...apartmentData } = updateDto;

    return this.prisma.apartment.update({
      where: { id },
      data: apartmentData,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.apartment.delete({
      where: { id },
    });
  }

  async updateStatus(userId: string, id: string, status: ApartmentStatus) {
    await this.findOne(userId, id);

    return this.prisma.apartment.update({
      where: { id },
      data: { status },
    });
  }

  async extensionImport(userId: string, createDto: CreateApartmentDto) {
    // 1. Duplicate check
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
      // Create a FAILED log for the duplicate attempt
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
      throw new ConflictException('This apartment already exists in your account.');
    }

    try {
      // 2. Safe Parsing of Numeric Fields
      const rentPrice = createDto.rentPrice !== undefined && createDto.rentPrice !== null ? Number(createDto.rentPrice) : null;
      const warmRent = createDto.warmRent !== undefined && createDto.warmRent !== null ? Number(createDto.warmRent) : null;
      const coldRent = createDto.coldRent !== undefined && createDto.coldRent !== null ? Number(createDto.coldRent) : null;
      const deposit = createDto.deposit !== undefined && createDto.deposit !== null ? Number(createDto.deposit) : null;
      const rooms = createDto.rooms !== undefined && createDto.rooms !== null ? Number(createDto.rooms) : null;
      const squareMeters = createDto.squareMeters !== undefined && createDto.squareMeters !== null ? Number(createDto.squareMeters) : null;

      // 3. Safe Parsing of Booleans
      const furnished = createDto.furnished !== undefined && createDto.furnished !== null ? Boolean(createDto.furnished) : false;
      const petsAllowed = createDto.petsAllowed !== undefined && createDto.petsAllowed !== null ? Boolean(createDto.petsAllowed) : false;

      // 4. Safe Parsing of Dates
      const moveInDate = createDto.moveInDate ? new Date(createDto.moveInDate) : null;

      // 5. Determine coverImage
      const coverImage = createDto.coverImage || (createDto.images && createDto.images.length > 0 ? createDto.images[0] : null);

      // 6. Create apartment record
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

      // 7. Create SUCCESS log
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

      // 8. Update user connection state
      await this.prisma.user.update({
        where: { id: userId },
        data: { extensionConnected: true }
      });

      return apartment;
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Create a FAILED log for the duplicate attempt
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
        throw new ConflictException('This apartment already exists in your account.');
      }

      // 9. Log any unexpected errors
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
}
