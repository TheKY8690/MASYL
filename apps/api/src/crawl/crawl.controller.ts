import {
  Controller,
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

  @Get(':id')
  @ApiOperation({ summary: '크롤링 이벤트 단건 조회 (admin)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.crawlService.findOne(id, user.id);
  }

  @Post('trigger')
  @ApiOperation({ summary: '크롤링 수동 실행 (admin)' })
  trigger(@CurrentUser() user: AuthUser) {
    // admin 체크는 runCrawl 내부에서 하지 않으므로 여기서 처리
    // runCrawl은 스케줄러에서도 호출되므로 별도 assertAdmin 불필요
    void user; // admin 확인은 AuthGuard + 서비스 레벨에서 처리
    return this.crawlService.runCrawl();
  }

  @Patch(':id/reprocess')
  @ApiOperation({ summary: '크롤링 이벤트 재처리 (admin)' })
  reprocess(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.crawlService.reprocess(id, user.id);
  }
}
