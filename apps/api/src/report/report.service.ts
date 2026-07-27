import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '../drizzle/schema';
import { DRIZZLE } from '../drizzle/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { CreateReportDto } from './dto/create-report.dto';
import { RejectReportDto } from './dto/reject-report.dto';

@Injectable()
export class ReportService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

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

  private async findOneInternal(id: string) {
    const [report] = await this.db
      .select()
      .from(schema.userReports)
      .where(eq(schema.userReports.id, id))
      .limit(1);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  //admin: 전체/ user: 본인 것만
  async findAll(userId: string) {
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    if (profile?.role === 'admin') {
      return this.db.select().from(schema.userReports);
    }
    return this.db
      .select()
      .from(schema.userReports)
      .where(eq(schema.userReports.reporterId, userId));
  }

  async findOne(id: string, userId: string) {
    const report = await this.findOneInternal(id);
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    if (profile?.role !== 'admin' && report.reporterId !== userId) {
      throw new ForbiddenException('접근 권한 없음');
    }
    return report;
  }

  async create(dto: CreateReportDto, userId: string) {
    const [report] = await this.db
      .insert(schema.userReports)
      .values({
        cafeId: dto.cafeId,
        reporterId: userId,
        discountId: dto.discountId ?? null,
        content: dto.content,
        imageUrls: dto.imageUrls ?? null,
      })
      .returning();
    return report;
  }

  //승인 -> Discount에 user_report레코드 생성
  async approve(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    const report = await this.findOneInternal(id);

    const [discount] = await this.db
      .insert(schema.discounts)
      .values({
        cafeId: report.cafeId,
        title: report.content.slice(0, 200),
        discountType: 'other',
        discountValue: '-',
        sourceType: 'user_report',
        createdBy: report.reporterId,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      })
      .returning();

    const [updated] = await this.db
      .update(schema.userReports)
      .set({ status: 'approved', reviewedBy: adminId, reviewedAt: new Date() })
      .where(eq(schema.userReports.id, id))
      .returning();

    return { report: updated, discount };
  }

  async reject(id: string, adminId: string, dto: RejectReportDto) {
    await this.assertAdmin(adminId);
    await this.findOneInternal(id);
    const [updated] = await this.db
      .update(schema.userReports)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectReason: dto.rejectReason,
      })
      .where(eq(schema.userReports.id, id))
      .returning();
    return updated;
  }
}
