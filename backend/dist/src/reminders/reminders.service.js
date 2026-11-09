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
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = __importStar(require("nodemailer"));
let RemindersService = RemindersService_1 = class RemindersService {
    prisma;
    logger = new common_1.Logger(RemindersService_1.name);
    mailTransporter = null;
    schedulerInterval = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (smtpHost && smtpUser && smtpPass) {
            this.mailTransporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.logger.log('SMTP mail transporter initialized successfully.');
        }
        else {
            this.logger.warn('SMTP settings missing in environment. Email reminders will be logged to console in simulator.');
        }
        this.startScheduler();
    }
    onModuleDestroy() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.logger.log('Reminder scheduler interval stopped.');
        }
    }
    startScheduler() {
        this.logger.log('Starting background reminder scheduler...');
        this.schedulerInterval = setInterval(() => {
            this.processPendingReminders();
        }, 15000);
    }
    async processPendingReminders() {
        try {
            const now = new Date();
            const dueReminders = await this.prisma.reminder.findMany({
                where: {
                    completed: false,
                    dateTime: {
                        lte: now,
                    },
                },
                include: {
                    user: true,
                    apartment: true,
                },
            });
            if (dueReminders.length === 0)
                return;
            this.logger.log(`Found ${dueReminders.length} due reminders to process.`);
            for (const reminder of dueReminders) {
                try {
                    await this.prisma.reminder.update({
                        where: { id: reminder.id },
                        data: { completed: true },
                    });
                    const user = reminder.user;
                    if (user.inAppReminders) {
                        const aptTitle = reminder.apartment ? ` for ${reminder.apartment.title}` : '';
                        await this.prisma.notification.create({
                            data: {
                                userId: user.id,
                                title: `Reminder: ${reminder.title}`,
                                message: reminder.description || `Your reminder${aptTitle} is due now.`,
                            },
                        });
                        this.logger.log(`Created in-app notification for user ${user.email} (Reminder ID: ${reminder.id})`);
                    }
                    if (user.emailReminders) {
                        const aptDetails = reminder.apartment
                            ? `\nApartment: ${reminder.apartment.title}\nAddress: ${reminder.apartment.address || 'N/A'}`
                            : '';
                        const emailSubject = `Reminder: ${reminder.title}`;
                        const emailBody = `Hello ${user.fullName || 'User'},\n\nThis is a reminder for you:\n\nTitle: ${reminder.title}\nDescription: ${reminder.description || 'No description provided.'}${aptDetails}\nTime: ${reminder.dateTime.toLocaleString()}\n\nBest regards,\nWohnBoard Team`;
                        await this.sendEmail(user.email, emailSubject, emailBody);
                    }
                }
                catch (innerError) {
                    this.logger.error(`Failed to process reminder ID ${reminder.id}: ${innerError.message}`);
                }
            }
        }
        catch (error) {
            if (!error?.message?.includes('Can\'t reach database server')) {
                this.logger.error(`Error processing pending reminders: ${error.message}`);
            }
        }
    }
    async sendEmail(to, subject, text) {
        if (this.mailTransporter) {
            try {
                await this.mailTransporter.sendMail({
                    from: process.env.SMTP_FROM || '"WohnBoard" <noreply@wohnboard.com>',
                    to,
                    subject,
                    text,
                });
                this.logger.log(`Email reminder successfully sent to ${to}`);
            }
            catch (error) {
                this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            }
        }
        else {
            this.logger.log(`\n==================================================\n[EMAIL SIMULATOR] To: ${to}\nSubject: ${subject}\nContent:\n${text}\n==================================================\n`);
        }
    }
    create(userId, data) {
        return this.prisma.reminder.create({
            data: { ...data, userId },
        });
    }
    findAll(userId) {
        return this.prisma.reminder.findMany({
            where: { userId },
            include: { apartment: true },
            orderBy: { dateTime: 'asc' }
        });
    }
    async update(userId, id, data) {
        return this.prisma.reminder.updateMany({
            where: { id, userId },
            data,
        });
    }
    remove(userId, id) {
        return this.prisma.reminder.deleteMany({ where: { id, userId } });
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map