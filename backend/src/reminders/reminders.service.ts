import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderType } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RemindersService.name);
  private mailTransporter: nodemailer.Transporter | null = null;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {}

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
    } else {
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

  private startScheduler() {
    this.logger.log('Starting background reminder scheduler...');
    // Run every 15 seconds
    this.schedulerInterval = setInterval(() => {
      this.processPendingReminders();
    }, 15000);
  }

  private async processPendingReminders() {
    try {
      const now = new Date();
      // Find all due and uncompleted reminders
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

      if (dueReminders.length === 0) return;

      this.logger.log(`Found ${dueReminders.length} due reminders to process.`);

      for (const reminder of dueReminders) {
        try {
          // Mark completed first to avoid race conditions/duplicate triggers
          await this.prisma.reminder.update({
            where: { id: reminder.id },
            data: { completed: true },
          });

          const user = reminder.user;

          // 1. In-App Notification
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

          // 2. Email Notification
          if (user.emailReminders) {
            const aptDetails = reminder.apartment 
              ? `\nApartment: ${reminder.apartment.title}\nAddress: ${reminder.apartment.address || 'N/A'}`
              : '';
            const emailSubject = `Reminder: ${reminder.title}`;
            const emailBody = `Hello ${user.fullName || 'User'},\n\nThis is a reminder for you:\n\nTitle: ${reminder.title}\nDescription: ${reminder.description || 'No description provided.'}${aptDetails}\nTime: ${reminder.dateTime.toLocaleString()}\n\nBest regards,\nWohnBoard Team`;

            await this.sendEmail(user.email, emailSubject, emailBody);
          }

        } catch (innerError: any) {
          this.logger.error(`Failed to process reminder ID ${reminder.id}: ${innerError.message}`);
        }
      }
    } catch (error: any) {
      if (!error?.message?.includes('Can\'t reach database server')) {
        this.logger.error(`Error processing pending reminders: ${error.message}`);
      }
    }
  }

  private async sendEmail(to: string, subject: string, text: string) {
    if (this.mailTransporter) {
      try {
        await this.mailTransporter.sendMail({
          from: process.env.SMTP_FROM || '"WohnBoard" <noreply@wohnboard.com>',
          to,
          subject,
          text,
        });
        this.logger.log(`Email reminder successfully sent to ${to}`);
      } catch (error: any) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      }
    } else {
      this.logger.log(`\n==================================================\n[EMAIL SIMULATOR] To: ${to}\nSubject: ${subject}\nContent:\n${text}\n==================================================\n`);
    }
  }

  create(userId: string, data: { apartmentId?: string; title: string; description?: string; type: ReminderType; dateTime: Date }) {
    return this.prisma.reminder.create({
      data: { ...data, userId },
    });
  }

  findAll(userId: string) {
    return this.prisma.reminder.findMany({ 
      where: { userId }, 
      include: { apartment: true },
      orderBy: { dateTime: 'asc' } 
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.reminder.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.reminder.deleteMany({ where: { id, userId } });
  }
}
