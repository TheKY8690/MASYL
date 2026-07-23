import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '@masyl/types';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseUser = (req as any).user as AuthUser;
    return this.authService.upsertUser(supabaseUser);
  }
}
