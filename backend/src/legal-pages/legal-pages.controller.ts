import { 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Req, 
  Ip 
} from '@nestjs/common';
import { LegalPagesService } from './legal-pages.service';
import { UpdateLegalPageDto, PublishLegalPageDto } from './dto/legal-page.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { LegalPageType } from '@prisma/client';

@Controller()
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  // --- Public Endpoints ---

  @Get('legal-pages/published')
  getPublishedStatus() {
    return this.legalPagesService.getPublishedStatus();
  }

  @Get('legal-pages/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.legalPagesService.findBySlug(slug);
  }

  @Get('legal-pages/type/:type')
  findByType(@Param('type') type: string) {
    // Cast string to enum validation
    const pageType = type.toUpperCase() as LegalPageType;
    return this.legalPagesService.findByType(pageType);
  }

  // --- Admin CMS Endpoints (Protected) ---

  @Get('control/legal-pages')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.legalPagesService.findAllAdmin();
  }

  @Get('control/legal-pages/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOneAdmin(@Param('id') id: string) {
    return this.legalPagesService.findOneAdmin(id);
  }

  @Patch('control/legal-pages/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateLegalPageDto,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminId = req.user.userId;
    return this.legalPagesService.update(id, dto, adminId, ip);
  }

  @Post('control/legal-pages/:id/publish')
  @UseGuards(JwtAuthGuard, AdminGuard)
  publish(
    @Param('id') id: string,
    @Body() dto: PublishLegalPageDto,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminId = req.user.userId;
    const adminEmail = req.user.email;
    return this.legalPagesService.publish(id, dto, adminId, adminEmail, ip);
  }

  @Post('control/legal-pages/:id/unpublish')
  @UseGuards(JwtAuthGuard, AdminGuard)
  unpublish(
    @Param('id') id: string,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminId = req.user.userId;
    return this.legalPagesService.unpublish(id, adminId, ip);
  }

  @Get('control/legal-pages/:id/versions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getVersions(@Param('id') id: string) {
    return this.legalPagesService.getVersions(id);
  }

  @Post('control/legal-pages/:id/restore/:versionId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  restore(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminId = req.user.userId;
    return this.legalPagesService.restore(id, versionId, adminId, ip);
  }
}
