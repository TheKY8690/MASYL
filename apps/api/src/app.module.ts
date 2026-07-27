import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { CafeModule } from './cafe/cafe.module';
import { DiscountModule } from './discount/discount.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    AuthModule,
    CafeModule,
    DiscountModule,
    ReportModule,
  ],
})
export class AppModule {}
