import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { CrawlScheduler } from './crawl.scheduler';
import { WebsiteScraper } from './scrapers/website.scraper';
import { DiscountExtractor } from './llm/discount-extractor';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CrawlController],
  providers: [CrawlService, CrawlScheduler, WebsiteScraper, DiscountExtractor],
})
export class CrawlModule {}
