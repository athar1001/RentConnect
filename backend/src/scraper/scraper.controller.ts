import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('apartments')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importApartment(@Req() req: Request, @Body('url') url: string) {
    return this.scraperService.scrapeAndImport((req.user as any).userId, url);
  }
}
