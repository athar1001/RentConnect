import { Controller, Get, Patch, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('settings')
  getSettings(@Req() req: Request) {
    return this.usersService.getSettings((req.user as any).userId);
  }

  @Patch('settings')
  updateSettings(@Req() req: Request, @Body() body: any) {
    return this.usersService.updateSettings((req.user as any).userId, body);
  }

  @Get('import-logs')
  getImportLogs(@Req() req: Request) {
    return this.usersService.getImportLogs((req.user as any).userId);
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    return this.usersService.getStats((req.user as any).userId);
  }

  @Get('export')
  exportData(@Req() req: Request) {
    return this.usersService.exportData((req.user as any).userId);
  }

  @Patch('password')
  updatePassword(@Req() req: Request, @Body() body: any) {
    return this.usersService.updatePassword((req.user as any).userId, body);
  }

  @Delete('me')
  requestDeletion(@Req() req: Request) {
    return this.usersService.requestDeletion((req.user as any).userId);
  }
}
