import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HousingIdentityService } from './housing-identity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UpdatePersonalInfoDto,
  UpdateHouseholdInfoDto,
  UpdateEmploymentInfoDto,
  UpdatePreferencesDto,
  UpdateRentalHistoryDto,
  UpdateGuarantorInfoDto,
  UpdateBioDto,
  CreateShareLinkDto,
} from './dto/update-housing-identity.dto';

@Controller('housing-identity')
export class HousingIdentityController {
  constructor(private readonly housingIdentityService: HousingIdentityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req: any) {
    return this.housingIdentityService.getOrCreateIdentity(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('personal')
  async updatePersonal(@Req() req: any, @Body() dto: UpdatePersonalInfoDto) {
    return this.housingIdentityService.updatePersonalInfo(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('household')
  async updateHousehold(@Req() req: any, @Body() dto: UpdateHouseholdInfoDto) {
    return this.housingIdentityService.updateHouseholdInfo(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('employment')
  async updateEmployment(@Req() req: any, @Body() dto: UpdateEmploymentInfoDto) {
    return this.housingIdentityService.updateEmploymentInfo(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.housingIdentityService.updatePreferences(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('rental-history')
  async updateRentalHistory(@Req() req: any, @Body() dto: UpdateRentalHistoryDto) {
    return this.housingIdentityService.updateRentalHistory(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('guarantor')
  async updateGuarantor(@Req() req: any, @Body() dto: UpdateGuarantorInfoDto) {
    return this.housingIdentityService.updateGuarantorInfo(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bio')
  async updateBio(@Req() req: any, @Body() dto: UpdateBioDto) {
    return this.housingIdentityService.updateBio(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('share')
  async createShareLink(@Req() req: any, @Body() dto: CreateShareLinkDto) {
    return this.housingIdentityService.createShareLink(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('share')
  async getShareLinks(@Req() req: any) {
    return this.housingIdentityService.getUserShareLinks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('share/:id')
  async revokeShareLink(@Req() req: any, @Param('id') id: string) {
    return this.housingIdentityService.revokeShareLink(req.user.id, id);
  }
}

@Controller('public/profile')
export class PublicProfileController {
  constructor(private readonly housingIdentityService: HousingIdentityService) {}

  @Get(':token')
  async getPublicProfile(
    @Param('token') token: string,
    @Query('password') password?: string,
  ) {
    return this.housingIdentityService.getPublicProfile(token, password);
  }

  @Post(':token')
  async accessPublicProfileWithPassword(
    @Param('token') token: string,
    @Body('password') password?: string,
  ) {
    return this.housingIdentityService.getPublicProfile(token, password);
  }
}
