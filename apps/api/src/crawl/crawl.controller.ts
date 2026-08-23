import {
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrawlService } from './crawl.service';
import { CrawledEventQueryDto } from './dto/crawled-event-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '@masyl/types';

@ApiTags('crawled-events')
@Controller('crawled-events')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get()
  @ApiOperation({ summary: '크롤링 이벤트 목록 (admin)' })
  findAll(@Query() query: CrawledEventQueryDto, @CurrentUser() user: AuthUser) {
    return this.crawlService.findAll(user.id, query);
  }

  @Get('progress')
  @ApiOperation({ summary: '크롤링 진행률 조회 (admin)' })
  getProgress() {
    return this.crawlService.getProgress();
  }

  @Get(':id')
  @ApiOperation({ summary: '크롤링 이벤트 단건 조회 (admin)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.crawlService.findOne(id, user.id);
  }

  @Post('trigger')
  @ApiOperation({ summary: '크롤링 수동 실행 (admin)' })
  trigger(@CurrentUser() user: AuthUser) {
    void user;
    if (this.crawlService.getProgress().isRunning) {
      throw new ConflictException('크롤링이 이미 실행 중입니다');
    }
    void this.crawlService.runCrawl();
    return { message: '크롤링 시작됨' };
  }

  @Patch(':id/reprocess')
  @ApiOperation({ summary: '크롤링 이벤트 재처리 (admin)' })
  reprocess(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.crawlService.reprocess(id, user.id);
  }

  @Delete('failed')
  @ApiOperation({ summary: '실패 이벤트 전체 삭제 (admin)' })
  removeAllFailed(@CurrentUser() user: AuthUser) {
    return this.crawlService.removeAllFailed(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '크롤링 이벤트 삭제 (admin, failed만)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.crawlService.remove(id, user.id);
  }
}
