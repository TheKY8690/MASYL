import * as schema from '../drizzle/schema';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { and, eq, getTableColumns, isNotNull } from 'drizzle-orm';
import { WebsiteScraper } from './scrapers/website.scraper';
import { DiscountExtractor } from './llm/discount-extractor';
import { CrawledEventQueryDto } from './dto/crawled-event-query.dto';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  private crawlProgress = {
    isRunning: false,
    total: 0,
    current: 0,
    currentBrand: '',
  };

  getProgress() {
    return {
      ...this.crawlProgress,
      percent:
        this.crawlProgress.total > 0
          ? Math.round(
              (this.crawlProgress.current / this.crawlProgress.total) * 100,
            )
          : 0,
    };
  }

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
      .select({
        ...getTableColumns(schema.crawledEvents),
        brandName: schema.brands.name,
        discountValidFrom: schema.discounts.validFrom,
        discountValidUntil: schema.discounts.validUntil,
        discountTitle: schema.discounts.title,
      })
      .from(schema.crawledEvents)
      .leftJoin(
        schema.brands,
        eq(schema.crawledEvents.brandId, schema.brands.id),
      )
      .leftJoin(
        schema.discounts,
        eq(schema.crawledEvents.discountId, schema.discounts.id),
      )
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
    const brands = await this.db
      .select()
      .from(schema.brands)
      .where(isNotNull(schema.brands.websiteUrl));

    this.logger.log(`Starting crawl for ${brands.length} brands`);
    this.crawlProgress = {
      isRunning: true,
      total: brands.length,
      current: 0,
      currentBrand: '',
    };
    let processed = 0;
    let failed = 0;

    try {
      for (const brand of brands) {
        this.crawlProgress.current++;
        this.crawlProgress.currentBrand = brand.name;
        try {
          await this.crawlBrand(brand);
          processed++;
        } catch (e) {
          this.logger.error(
            `Failed to crawl brand ${brand.name}: ${String(e)}`,
          );
          failed++;
        }
        await sleep(2000);
      }
    } finally {
      this.crawlProgress.isRunning = false;
    }

    this.logger.log(`Crawl complete. processed=${processed} failed=${failed}`);
    return { processed, failed };
  }

  private async crawlBrand(
    brand: typeof schema.brands.$inferSelect,
  ): Promise<void> {
    const websiteUrl = brand.websiteUrl!;
    const rawContent = await this.scraper.scrape(websiteUrl);

    const [event] = await this.db
      .insert(schema.crawledEvents)
      .values({
        brandId: brand.id,
        sourceType: 'website',
        sourceUrl: websiteUrl,
        rawContent,
      })
      .returning();

    if (!event) throw new Error('Failed to insert crawledEvent');
    await this.processEvent(event, brand.name);
  }

  async remove(id: string, adminId: string) {
    const event = await this.findOne(id, adminId);
    if (event.status !== 'failed') {
      throw new BadRequestException('failed 상태 이벤트만 삭제할 수 있습니다');
    }
    await this.db
      .delete(schema.crawledEvents)
      .where(eq(schema.crawledEvents.id, id));
    return { deleted: 1 };
  }

  async removeAllFailed(adminId: string) {
    await this.assertAdmin(adminId);
    const deleted = await this.db
      .delete(schema.crawledEvents)
      .where(eq(schema.crawledEvents.status, 'failed'))
      .returning({ id: schema.crawledEvents.id });
    return { deleted: deleted.length };
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

      if (extracted.length === 0) {
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

      const inserted = await this.db
        .insert(schema.discounts)
        .values(
          extracted.map((e) => ({
            brandId: event.brandId,
            title: e.title,
            description: e.description,
            discountType: e.discountType,
            discountValue: e.discountValue,
            eventUrl: e.eventUrl ?? null,
            sourceType: 'auto_crawl' as const,
            status: 'active' as const,
            validFrom: e.validFrom ? new Date(e.validFrom) : null,
            validUntil: e.validUntil ? new Date(e.validUntil) : null,
            crawledEventId: event.id,
          })),
        )
        .returning();

      await this.db
        .update(schema.crawledEvents)
        .set({
          status: 'processed',
          processedAt: new Date(),
          summary: extracted.map((e) => e.title).join(' / '),
          discountId: inserted[0]?.id ?? null,
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
