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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const totalUsers = await this.prisma.user.count();
        const activeUsers = await this.prisma.user.count({ where: { status: 'ACTIVE' } });
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
        const extensionImportsCount = await this.prisma.importLog.count({ where: { isExtension: true } });
        const extensionFailedImports = await this.prisma.importLog.count({ where: { isExtension: true, status: 'FAILED' } });
        const extensionSuccessRate = extensionImportsCount > 0
            ? Math.round(((extensionImportsCount - extensionFailedImports) / extensionImportsCount) * 100)
            : 100;
        const extensionLogs = await this.prisma.importLog.findMany({
            where: { isExtension: true },
            select: { platform: true, status: true }
        });
        const extStats = {};
        extensionLogs.forEach(log => {
            const p = log.platform || 'Unknown';
            if (!extStats[p])
                extStats[p] = { total: 0, success: 0 };
            extStats[p].total++;
            if (log.status === 'SUCCESS')
                extStats[p].success++;
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
    async updateUserStatus(adminId, userId, status) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { status }
        });
        await this.logAudit(adminId, `USER_STATUS_CHANGED_TO_${status}`, 'User', userId);
        return { success: true };
    }
    async getImports() {
        return this.prisma.importLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true } }
            }
        });
    }
    async getScraperHealth() {
        const total = await this.prisma.importLog.count();
        if (total === 0)
            return { platforms: [] };
        const logs = await this.prisma.importLog.findMany({
            select: { platform: true, status: true }
        });
        const stats = {};
        logs.forEach(log => {
            const p = log.platform || 'Unknown';
            if (!stats[p])
                stats[p] = { total: 0, success: 0 };
            stats[p].total++;
            if (log.status === 'SUCCESS')
                stats[p].success++;
        });
        return Object.entries(stats).map(([platform, data]) => ({
            platform,
            total: data.total,
            successRate: Math.round((data.success / data.total) * 100)
        }));
    }
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
    async getFeedbacks() {
        return this.prisma.feedback.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateFeedbackStatus(adminId, feedbackId, status) {
        const fb = await this.prisma.feedback.update({
            where: { id: feedbackId },
            data: { status }
        });
        await this.logAudit(adminId, `FEEDBACK_STATUS_CHANGED_TO_${status}`, 'Feedback', feedbackId);
        return fb;
    }
    async getReminders() {
        return this.prisma.reminder.findMany({
            include: {
                user: { select: { email: true } },
                apartment: { select: { title: true } }
            },
            orderBy: { dateTime: 'desc' }
        });
    }
    async getGdprRequests() {
        return this.prisma.user.findMany({
            where: { deletionRequested: true },
            select: { id: true, email: true, fullName: true, createdAt: true }
        });
    }
    async getAuditLogs() {
        return this.prisma.adminAuditLog.findMany({
            include: { admin: { select: { email: true } } },
            orderBy: { timestamp: 'desc' }
        });
    }
    async logAudit(adminId, action, entity, targetId) {
        await this.prisma.adminAuditLog.create({
            data: {
                adminId,
                action,
                targetEntity: targetId ? `${entity}:${targetId}` : entity,
            }
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map