import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  CreateApplicationNoteDto,
  CreateApplicationReminderDto,
  CreateApplicationShareDto,
  FulfillRequestDto,
} from './dto/applications.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getApplications(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string
  ) {
    return this.applicationsService.getUserApplications(req.user.id, { status, search, sort });
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.applicationsService.getAnalytics(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getApplication(@Req() req: any, @Param('id') id: string) {
    return this.applicationsService.getApplicationById(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto
  ) {
    return this.applicationsService.updateApplication(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  async addNote(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateApplicationNoteDto
  ) {
    return this.applicationsService.addNote(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reminders')
  async addReminder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateApplicationReminderDto
  ) {
    return this.applicationsService.addReminder(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/sharing')
  async createSharing(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateApplicationShareDto
  ) {
    return this.applicationsService.createSharing(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/sharing')
  async revokeSharing(@Req() req: any, @Param('id') id: string) {
    return this.applicationsService.revokeSharing(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/document-requests/:requestId/fulfill')
  async fulfillDocumentRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Body() dto: FulfillRequestDto
  ) {
    return this.applicationsService.fulfillDocumentRequest(req.user.id, id, requestId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/withdraw')
  async withdraw(@Req() req: any, @Param('id') id: string) {
    return this.applicationsService.withdrawApplication(req.user.id, id);
  }

  // Simulation endpoint for landlords requesting documents
  @UseGuards(JwtAuthGuard)
  @Post(':id/document-request')
  async requestDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body('requestedType') requestedType: string,
    @Body('description') description?: string
  ) {
    return this.applicationsService.createDocumentRequest(req.user.id, id, requestedType, description);
  }

  // --- Timeline Centerpiece & Event Collaboration Endpoints ---

  @Get(':id/timeline')
  async getTimelineFeed(@Param('id') id: string) {
    return this.applicationsService.getTimelineFeed(id);
  }

  @Post('timeline/:timelineId/comments')
  async addTimelineComment(
    @Param('timelineId') timelineId: string,
    @Body('senderType') senderType: string,
    @Body('senderName') senderName: string,
    @Body('content') content: string
  ) {
    return this.applicationsService.addTimelineComment(timelineId, senderType, senderName, content);
  }

  @Post(':id/viewings/:viewingId/rsvp')
  async respondToViewing(
    @Param('id') id: string,
    @Param('viewingId') viewingId: string,
    @Body('action') action: 'ACCEPT' | 'DECLINE' | 'RESCHEDULE',
    @Body('notes') notes?: string
  ) {
    return this.applicationsService.respondToViewing(id, viewingId, action, notes);
  }

  @Post(':id/offers/:offerId/respond')
  async respondToOffer(
    @Param('id') id: string,
    @Param('offerId') offerId: string,
    @Body('action') action: 'ACCEPT' | 'DECLINE'
  ) {
    return this.applicationsService.respondToOffer(id, offerId, action);
  }
}

@Controller('public/application')
export class PublicApplicationController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get(':token')
  async getPublicApplication(
    @Param('token') token: string,
    @Query('password') password?: string
  ) {
    return this.applicationsService.getPublicApplication(token, password);
  }

  @Post(':token')
  async accessPublicApplicationWithPassword(
    @Param('token') token: string,
    @Body('password') password?: string
  ) {
    return this.applicationsService.getPublicApplication(token, password);
  }
}
