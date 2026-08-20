import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { BrandModule } from './brand/brand.module';
import { CafeModule } from './cafe/cafe.module';
import { DiscountModule } from './discount/discount.module';
import { ReportModule } from './report/report.module';
import { CrawlModule } from './crawl/crawl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    AuthModule,
    BrandModule,
    CafeModule,
    DiscountModule,
    ReportModule,
    CrawlModule,
  ],
})
export class AppModule {}
