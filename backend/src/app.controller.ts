import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { RegisterDto } from './auth/register.dto';
import { SkipAuth } from './common/decorators';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    id: number;
    username: string;
  };
};

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @Post('auth/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.email,
    );
  }

  @UseGuards(LocalAuthGuard)
  @SkipAuth()
  @Post('auth/login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
