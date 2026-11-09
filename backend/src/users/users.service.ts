import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        preferredState: true,
        preferredCity: true,
        preferredLanguage: true,
        emailReminders: true,
        inAppReminders: true,
        extensionConnected: true,
      }
    });
  }

  async getStats(userId: string) {
    const [apartments, reminders, documentsCount, documents] = await Promise.all([
      this.prisma.apartment.count({ where: { userId } }),
      this.prisma.reminder.count({ where: { userId } }),
      this.prisma.document.count({ where: { userId } }),
      this.prisma.document.findMany({ where: { userId }, select: { fileSize: true } })
    ]);

    const totalStorage = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    return {
      apartments,
      reminders,
      documents: documentsCount,
      totalStorageBytes: totalStorage
    };
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        apartments: {
          include: {
            logs: true,
            checklists: true
          }
        },
        reminders: true,
        notes: true,
        documents: {
          select: {
            id: true,
            type: true,
            title: true,
            fileSize: true,
            createdAt: true
          } // exclude fileUrl for security/privacy in raw export
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');

    // Remove sensitive info
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updatePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: { id: true }
    });
  }

  async updateSettings(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email, // newly allowed
        preferredState: data.preferredState,
        preferredCity: data.preferredCity,
        preferredLanguage: data.preferredLanguage,
        emailReminders: data.emailReminders,
        inAppReminders: data.inAppReminders,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        preferredState: true,
        preferredCity: true,
        preferredLanguage: true,
        emailReminders: true,
        inAppReminders: true,
      }
    });
  }

  async requestDeletion(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequested: true,
      }
    });
  }

  async getImportLogs(userId: string) {
    return this.prisma.importLog.findMany({
      where: { userId, isExtension: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

