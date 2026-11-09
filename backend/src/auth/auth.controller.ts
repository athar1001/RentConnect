import { Controller, Post, Body, Res, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.register(registerDto);
    this.setCookie(res, access_token);
    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(loginDto);
    this.setCookie(res, access_token);
    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('control/login')
  async adminLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.adminLogin(loginDto);
    this.setCookie(res, access_token);
    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    const exists = await this.authService.checkEmailExists(email);
    return { exists };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('extension/status')
  getExtensionStatus(@Req() req: Request) {
    return this.authService.getExtensionStatus((req.user as any).userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('extension/connect')
  connectExtension(@Req() req: Request) {
    return this.authService.setExtensionConnection((req.user as any).userId, true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('extension/disconnect')
  disconnectExtension(@Req() req: Request) {
    return this.authService.setExtensionConnection((req.user as any).userId, false);
  }

  private setCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
}
