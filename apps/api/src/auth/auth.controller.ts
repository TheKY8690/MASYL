import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthUser } from '@masyl/types';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.upsertUser(user);
  }

  @Post('seller')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async becomeSeller(@CurrentUser() user: AuthUser) {
    await this.authService.upsertUser(user);
    return this.authService.becomeSeller(user.id);
  }
}
