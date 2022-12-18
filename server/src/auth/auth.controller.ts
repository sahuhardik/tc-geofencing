import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  async logout(): Promise<boolean> {
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@Request() req) {
    return req.user;
  }
}
