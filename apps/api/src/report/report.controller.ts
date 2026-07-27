import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '@masyl/types';
import { CreateReportDto } from './dto/create-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({ summary: '제보 목록 (admin=전체, user=본인)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.reportService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '제보 단건 조회' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: '제보 등록' })
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.reportService.create(dto, user.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: '제보 승인 (admin)' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '제보 거절(admin)' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectReportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reportService.reject(id, user.id, dto);
  }
}
