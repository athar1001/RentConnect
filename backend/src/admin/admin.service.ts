import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({ where: { status: 'ACTIVE' } });
    
    // Calculate start of this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await this.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } });

    const totalApartments = await this.prisma.apartment.count();
    const totalImports = await this.prisma.importLog.count();
    const failedImports = await this.prisma.importLog.count({ where: { status: 'FAILED' } });
    const totalDocuments = await this.prisma.document.count();
    
    const upcomingReminders = await this.prisma.reminder.count({
      where: { completed: false, dateTime: { gte: new Date() } }
    });
    
    const feedbackMessages = await this.prisma.feedback.count({ where: { status: 'OPEN' } });

    // Extension statistics
    const extensionImportsCount = await this.prisma.importLog.count({ where: { isExtension: true } });
    const extensionFailedImports = await this.prisma.importLog.count({ where: { isExtension: true, status: 'FAILED' } });
    const extensionSuccessRate = extensionImportsCount > 0 
      ? Math.round(((extensionImportsCount - extensionFailedImports) / extensionImportsCount) * 100) 
      : 100;

    const extensionLogs = await this.prisma.importLog.findMany({
      where: { isExtension: true },
      select: { platform: true, status: true }
    });

    const extStats: Record<string, { total: number, success: number }> = {};
    extensionLogs.forEach(log => {
      const p = log.platform || 'Unknown';
      if (!extStats[p]) extStats[p] = { total: 0, success: 0 };
      extStats[p].total++;
      if (log.status === 'SUCCESS') extStats[p].success++;
    });

    const extensionPlatformStats = Object.entries(extStats).map(([platform, data]) => ({
      platform,
      total: data.total,
      successRate: Math.round((data.success / data.total) * 100)
    }));

    const recentImports = await this.prisma.importLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    return {
      totalUsers, activeUsers, newUsersThisWeek,
      totalApartments, totalImports, failedImports,
      totalDocuments, upcomingReminders, feedbackMessages,
      recentImports,
      extensionImportsCount,
      extensionFailedImports,
      extensionSuccessRate,
      extensionPlatformStats
    };
  }

  // --- USERS ---
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true, role: true, 
        preferredLanguage: true, status: true, 
        createdAt: true, lastLogin: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUserStatus(adminId: string, userId: string, status: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    await this.logAudit(adminId, `USER_STATUS_CHANGED_TO_${status}`, 'User', userId);
    return { success: true };
  }

  // --- IMPORTS & SCRAPERS ---
  async getImports() {
    return this.prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } }
      }
    });
  }

  async getScraperHealth() {
    // Simple aggregation for phase 1
    const total = await this.prisma.importLog.count();
    if (total === 0) return { platforms: [] };

    const logs = await this.prisma.importLog.findMany({
      select: { platform: true, status: true }
    });

    const stats: Record<string, { total: number, success: number }> = {};
    logs.forEach(log => {
      const p = log.platform || 'Unknown';
      if (!stats[p]) stats[p] = { total: 0, success: 0 };
      stats[p].total++;
      if (log.status === 'SUCCESS') stats[p].success++;
    });

    return Object.entries(stats).map(([platform, data]) => ({
      platform,
      total: data.total,
      successRate: Math.round((data.success / data.total) * 100)
    }));
  }

  // --- APARTMENTS ---
  async getApartments() {
    return this.prisma.apartment.findMany({
      select: {
        id: true, title: true, city: true, status: true, 
        sourcePlatform: true, createdAt: true,
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- DOCUMENTS ---
  async getDocuments() {
    return this.prisma.document.findMany({
      select: {
        id: true, type: true, title: true, fileSize: true,
        createdAt: true, mimeType: true,
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- FEEDBACK ---
  async getFeedbacks() {
    return this.prisma.feedback.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateFeedbackStatus(adminId: string, feedbackId: string, status: any) {
    const fb = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: { status }
    });
    await this.logAudit(adminId, `FEEDBACK_STATUS_CHANGED_TO_${status}`, 'Feedback', feedbackId);
    return fb;
  }

  // --- REMINDERS ---
  async getReminders() {
    return this.prisma.reminder.findMany({
      include: {
        user: { select: { email: true } },
        apartment: { select: { title: true } }
      },
      orderBy: { dateTime: 'desc' }
    });
  }

  // --- GDPR ---
  async getGdprRequests() {
    return this.prisma.user.findMany({
      where: { deletionRequested: true },
      select: { id: true, email: true, fullName: true, createdAt: true }
    });
  }

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    return this.prisma.adminAuditLog.findMany({
      include: { admin: { select: { email: true } } },
      orderBy: { timestamp: 'desc' }
    });
  }

  // --- HELPER ---
  async logAudit(adminId: string, action: string, entity: string, targetId?: string) {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetEntity: targetId ? `${entity}:${targetId}` : entity,
      }
    });
  }
}
