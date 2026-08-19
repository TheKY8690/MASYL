import * as schema from '../drizzle/schema';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { and, eq, isNotNull } from 'drizzle-orm';
import { WebsiteScraper } from './scrapers/website.scraper';
import { DiscountExtractor } from './llm/discount-extractor';
import { CrawledEventQueryDto } from './dto/crawled-event-query.dto';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private scraper: WebsiteScraper,
    private extractor: DiscountExtractor,
  ) {}

  private async assertAdmin(userId: string) {
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    if (!profile || profile.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
  }

  async findAll(adminId: string, query: CrawledEventQueryDto) {
    await this.assertAdmin(adminId);
    const conditions = query.status
      ? [eq(schema.crawledEvents.status, query.status)]
      : [];
    return this.db
      .select()
      .from(schema.crawledEvents)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(query.limit ?? 20)
      .offset(query.offset ?? 0)
      .orderBy(schema.crawledEvents.createdAt);
  }

  async findOne(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    const [event] = await this.db
      .select()
      .from(schema.crawledEvents)
      .where(eq(schema.crawledEvents.id, id))
      .limit(1);
    if (!event) throw new NotFoundException(`CrawledEvent ${id} not found`);
    return event;
  }

  async runCrawl(): Promise<{ processed: number; failed: number }> {
    const cafes = await this.db
      .select()
      .from(schema.cafes)
      .where(isNotNull(schema.cafes.websiteUrl));

    this.logger.log(`Starting crawl for ${cafes.length} cafes`);
    let processed = 0;
    let failed = 0;

    for (const cafe of cafes) {
      try {
        await this.crawlCafe(cafe);
        processed++;
      } catch (e) {
        this.logger.error(`Failed to crawl cafe ${cafe.name}: ${String(e)}`);
        failed++;
      }
      await sleep(2000);
    }

    this.logger.log(`Crawl complete. processed=${processed} failed=${failed}`);
    return { processed, failed };
  }

  private async crawlCafe(
    cafe: typeof schema.cafes.$inferSelect,
  ): Promise<void> {
    const websiteUrl = cafe.websiteUrl!;
    const rawContent = await this.scraper.scrape(websiteUrl);

    const [event] = await this.db
      .insert(schema.crawledEvents)
      .values({
        cafeId: cafe.id,
        sourceType: 'website',
        sourceUrl: websiteUrl,
        rawContent,
      })
      .returning();

    if (!event) throw new Error('Failed to insert crawledEvent');
    await this.processEvent(event, cafe.name);
  }

  async reprocess(id: string, adminId: string) {
    const event = await this.findOne(id, adminId);
    await this.processEvent(event, '');
    return this.findOne(id, adminId);
  }

  async processEvent(
    event: typeof schema.crawledEvents.$inferSelect,
    cafeName: string,
  ): Promise<void> {
    try {
      const extracted = await this.extractor.extract(
        cafeName,
        event.sourceUrl,
        event.rawContent,
      );

      if (!extracted) {
        await this.db
          .update(schema.crawledEvents)
          .set({
            status: 'processed',
            processedAt: new Date(),
            summary: '할인 정보 없음',
          })
          .where(eq(schema.crawledEvents.id, event.id));
        return;
      }

      const [discount] = await this.db
        .insert(schema.discounts)
        .values({
          cafeId: event.cafeId,
          title: extracted.title,
          description: extracted.description,
          discountType: extracted.discountType,
          discountValue: extracted.discountValue,
          sourceType: 'auto_crawl',
          status: 'pending_review',
          validFrom: extracted.validFrom ? new Date(extracted.validFrom) : null,
          validUntil: extracted.validUntil
            ? new Date(extracted.validUntil)
            : null,
          crawledEventId: event.id,
        })
        .returning();

      if (!discount) throw new Error('Failed to insert discount');

      await this.db
        .update(schema.crawledEvents)
        .set({
          status: 'processed',
          processedAt: new Date(),
          summary: extracted.description,
          discountId: discount.id,
        })
        .where(eq(schema.crawledEvents.id, event.id));
    } catch (e) {
      this.logger.error(`processEvent failed for ${event.id}: ${String(e)}`);
      await this.db
        .update(schema.crawledEvents)
        .set({ status: 'failed' })
        .where(eq(schema.crawledEvents.id, event.id));
    }
  }
}
