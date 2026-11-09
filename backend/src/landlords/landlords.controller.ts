import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Header } from '@nestjs/common';
import { LandlordsService } from './landlords.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  CreateViewingDto,
  CreateLandlordNoteDto,
  CreateLandlordMessageDto,
  CompareApplicantsDto,
} from './dto/landlords.dto';

@Controller('landlords')
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  // Auxiliary helper to get default landlord context
  private async getLandlordId() {
    const landlord = await this.landlordsService.getOrCreateDefaultLandlord();
    return landlord.id;
  }

  // Properties Endpoints
  @Get('properties')
  async getProperties() {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getProperties(landlordId);
  }

  @Post('properties')
  async createProperty(@Body() dto: CreatePropertyDto) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.createProperty(landlordId, dto);
  }

  @Get('properties/:id')
  async getPropertyById(@Param('id') id: string) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getPropertyById(landlordId, id);
  }

  @Patch('properties/:id')
  async updateProperty(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.updateProperty(landlordId, id, dto);
  }

  @Delete('properties/:id')
  async deleteProperty(@Param('id') id: string) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.deleteProperty(landlordId, id);
  }

  // Applications Inbox & Details
  @Get('applications')
  async getApplications(
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getApplications(landlordId, { propertyId, status, search });
  }

  @Get('applications/:id')
  async getApplicationById(@Param('id') id: string) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getApplicationById(landlordId, id);
  }

  // Side-by-Side Comparison Matrix (Objective, no automated AI rank bias)
  @Post('applications/compare')
  async compareApplicants(@Body() dto: CompareApplicantsDto) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.compareApplicants(landlordId, dto.applicationIds);
  }

  // Viewing Scheduler & ICS Export
  @Post('viewings')
  async scheduleViewing(@Body() dto: CreateViewingDto) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.scheduleViewing(landlordId, dto);
  }

  @Get('viewings/:id/ics')
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename=viewing-invitation.ics')
  async getICSViewing(@Param('id') id: string) {
    return this.landlordsService.getICSViewing(id);
  }

  // Private Landlord Notes
  @Post('notes')
  async addNote(@Body() dto: CreateLandlordNoteDto) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.addNote(landlordId, dto, 'Property Manager');
  }

  // Messaging & Document Requests
  @Post('messages')
  async sendMessage(@Body() dto: CreateLandlordMessageDto) {
    return this.landlordsService.sendMessage(dto, 'Landlord Team');
  }

  @Post('applications/:id/document-request')
  async requestDocument(
    @Param('id') applicationId: string,
    @Body('requestedType') requestedType: string,
    @Body('description') description?: string
  ) {
    return this.landlordsService.requestDocument(applicationId, requestedType, description);
  }

  @Post('applications/:id/offer')
  async sendOffer(
    @Param('id') applicationId: string,
    @Body() dto: { rentPrice: number; moveInDate: string; deposit?: number; terms?: string }
  ) {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.sendOffer(landlordId, applicationId, dto);
  }

  // Analytics & GDPR Audit Logs
  @Get('analytics')
  async getAnalytics() {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getAnalytics(landlordId);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    const landlordId = await this.getLandlordId();
    return this.landlordsService.getAuditLogs(landlordId);
  }
}
