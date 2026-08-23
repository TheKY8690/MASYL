import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlService } from './crawl.service';

@Injectable()
export class CrawlScheduler {
  private readonly logger = new Logger(CrawlScheduler.name);

  constructor(private crawlService: CrawlService) {}

  // UTC 21:00 = KST 06:00
  @Cron('0 21 * * *')
  async runDailyCrawl() {
    this.logger.log('Daily crawl started');
    const result = await this.crawlService.runCrawl();
    this.logger.log(
      `Daily crawl finished: processed=${result.processed} failed=${result.failed}`,
    );
  }

  // UTC 15:00 = KST 00:00
  @Cron('0 15 * * *')
  async runDailyExpire() {
    this.logger.log('Daily expire started');
    const count = await this.crawlService.expireOldDiscounts();
    this.logger.log(`Daily expire finished: ${count} discounts expired`);
  }
}
