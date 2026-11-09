import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import type { Request } from 'express';
import { UserStatus, FeedbackStatus } from '@prisma/client';

@Controller('control')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: UserStatus
  ) {
    return this.adminService.updateUserStatus((req.user as any).userId, id, status);
  }

  @Get('imports')
  getImports() {
    return this.adminService.getImports();
  }

  @Get('scraper-health')
  getScraperHealth() {
    return this.adminService.getScraperHealth();
  }

  @Get('apartments')
  getApartments() {
    return this.adminService.getApartments();
  }

  @Get('documents')
  getDocuments() {
    return this.adminService.getDocuments();
  }

  @Get('feedbacks')
  getFeedbacks() {
    return this.adminService.getFeedbacks();
  }

  @Patch('feedbacks/:id/status')
  updateFeedbackStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: FeedbackStatus
  ) {
    return this.adminService.updateFeedbackStatus((req.user as any).userId, id, status);
  }

  @Get('reminders')
  getReminders() {
    return this.adminService.getReminders();
  }

  @Get('gdpr-requests')
  getGdprRequests() {
    return this.adminService.getGdprRequests();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
