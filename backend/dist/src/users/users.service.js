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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings(userId) {
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
    async getStats(userId) {
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
    async exportData(userId) {
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
                    }
                }
            }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, ...safeUser } = user;
        return safeUser;
    }
    async updatePassword(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
            select: { id: true }
        });
    }
    async updateSettings(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: data.fullName,
                email: data.email,
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
    async requestDeletion(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                deletionRequested: true,
            }
        });
    }
    async getImportLogs(userId) {
        return this.prisma.importLog.findMany({
            where: { userId, isExtension: true },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map