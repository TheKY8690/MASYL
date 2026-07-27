import * as schema from '../drizzle/schema';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import {
  and,
  eq,
  getTableColumns,
  gt,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { NearbyDiscountQueryDto } from './dto/nearby-discount-query.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
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

  private assertDateRange(
    validFrom?: string | null,
    validUntil?: string | null,
  ) {
    if (
      validFrom &&
      validUntil &&
      new Date(validUntil) <= new Date(validFrom)
    ) {
      throw new BadRequestException('validUntil must be after validFrom');
    }
  }
  //전체 목록 (개발 중 — 전체 반환. auth 추가 후 role 분기 예정)
  findAll(userId: string) {
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);

    if (profile?.role === 'admin') {
      return this.db.select().from(schema.discounts);
    }
    return this.db
      .select()
      .from(schema.discounts)
      .where(
        and(
          eq(schema.discounts.status, 'active'),
          or(
            isNull(schema.discounts.validUntil),
            gt(schema.discounts.validUntil, new Date()),
          ),
        ),
      );
  }

  // 내부 존재 확인용 — status 무관 (update/remove/approve/reject에서 사용)
  private async findOneInternal(id: string) {
    const [discount] = await this.db
      .select()
      .from(schema.discounts)
      .where(eq(schema.discounts.id, id))
      .limit(1);

    if (!discount) throw new NotFoundException(`Discount ${id} not found`);
    return discount;
  }

  //단건 조회 (공개용 — active + 미만료만)
  async findOne(id: string) {
    const now = new Date();
    const [discount] = await this.db
      .select()
      .from(schema.discounts)
      .where(
        and(
          eq(schema.discounts.id, id),
          eq(schema.discounts.status, 'active'),
          or(
            isNull(schema.discounts.validUntil),
            gt(schema.discounts.validUntil, now),
          ),
        ),
      )
      .limit(1);

    if (!discount) throw new NotFoundException(`Discount ${id} not found`);
    return discount;
  }

  //특정 카페의 할인 목록 (카페 상세페이지용 — active + 미만료만)
  findByCafe(cafeId: string) {
    const now = new Date();
    return this.db
      .select()
      .from(schema.discounts)
      .where(
        and(
          eq(schema.discounts.cafeId, cafeId),
          eq(schema.discounts.status, 'active'),
          or(
            isNull(schema.discounts.validUntil),
            gt(schema.discounts.validUntil, now),
          ),
        ),
      );
  }

  //내 위치 반경의 할인 조회 (active)
  findNearby({
    lat,
    lng,
    radius = 1,
    limit = 20,
    offset = 0,
  }: NearbyDiscountQueryDto) {
    const now = new Date();
    const latDelta = radius / 111.32;
    const lngDelta = radius / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceKm = sql<number>`
       6371 * acos(least(1,
         cos(radians(${lat})) * cos(radians(${schema.cafes.latitude}::float)) *
        cos(radians(${schema.cafes.longitude}::float) - radians(${lng})) +
         sin(radians(${lat})) * sin(radians(${schema.cafes.latitude}::float))
      ))
    `;
    return this.db
      .select({
        // discounts 필드 전체
        ...getTableColumns(schema.discounts),
        // 카페 이름/주소도 함께 반환 — 프론트 마커 표시용
        cafeName: schema.cafes.name,
        cafeAddress: schema.cafes.address,
        cafeLatitude: schema.cafes.latitude,
        cafeLongitude: schema.cafes.longitude,
        distanceKm,
      })
      .from(schema.discounts)
      .innerJoin(schema.cafes, eq(schema.discounts.cafeId, schema.cafes.id))
      .where(
        and(
          // active 상태만 노출
          eq(schema.discounts.status, 'active'),
          or(
            isNull(schema.discounts.validFrom),
            lte(schema.discounts.validFrom, now),
          ),
          or(
            isNull(schema.discounts.validUntil),
            gt(schema.discounts.validUntil, now),
          ),
          sql`${schema.cafes.latitude}::float BETWEEN ${lat - latDelta} AND ${lat + latDelta}`,
          sql`${schema.cafes.longitude}::float BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}`,
          sql`${distanceKm}<=${radius}`,
        ),
      )
      .orderBy(distanceKm)
      .limit(limit)
      .offset(offset);
  }

  //할인 등록
  async create(dto: CreateDiscountDto, userId?: string) {
    this.assertDateRange(dto.validFrom, dto.validUntil);
    const [discount] = await this.db
      .insert(schema.discounts)
      .values({
        cafeId: dto.cafeId,
        title: dto.title,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        sourceType: dto.sourceType,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        createdBy: userId ?? null,
      })
      .returning();
    return discount;
  }

  //할인 수정
  async update(id: string, dto: UpdateDiscountDto) {
    const existing = await this.findOneInternal(id);
    const mergedFrom =
      dto.validFrom !== undefined
        ? dto.validFrom
        : existing.validFrom?.toISOString();
    const mergedUntil =
      dto.validUntil !== undefined
        ? dto.validUntil
        : existing.validUntil?.toISOString();
    this.assertDateRange(mergedFrom, mergedUntil);

    const [update] = await this.db
      .update(schema.discounts)
      .set({
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.discountType !== undefined && {
          discountType: dto.discountType,
        }),
        ...(dto.discountValue !== undefined && {
          discountValue: dto.discountValue,
        }),
        ...(dto.validFrom !== undefined && {
          validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        }),
        ...(dto.validUntil !== undefined && {
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        }),
      })
      .where(eq(schema.discounts.id, id))
      .returning();
    return update;
  }

  //삭제
  async remove(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    await this.findOneInternal(id);
    await this.db.delete(schema.discounts).where(eq(schema.discounts.id, id));
  }

  //승인 // TODO: auth 추가 후 assertAdmin(userId) 호출
  async approve(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    await this.findOneInternal(id);
    const [updated] = await this.db
      .update(schema.discounts)
      .set({ status: 'active', verifiedAt: new Date(), verifiedBy: adminId })
      .where(eq(schema.discounts.id, id))
      .returning();
    return updated;
  }

  //거절 // TODO: auth 추가 후 assertAdmin(userId) 호출
  async reject(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    await this.findOneInternal(id);
    const [updated] = await this.db
      .update(schema.discounts)
      .set({ status: 'rejected', verifiedAt: new Date(), verifiedBy: adminId })
      .where(eq(schema.discounts.id, id))
      .returning();
    return updated;
  }
}
