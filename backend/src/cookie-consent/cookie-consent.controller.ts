import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CookieConsentService } from './cookie-consent.service';
import { UpdateCookieConsentDto } from './dto/cookie-consent.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('cookie-consent')
export class CookieConsentController {
  constructor(private readonly cookieConsentService: CookieConsentService) {}

  @Get()
  getConfig() {
    return this.cookieConsentService.getConfig();
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateConfig(@Body() dto: UpdateCookieConsentDto) {
    return this.cookieConsentService.updateConfig(dto);
  }
}
