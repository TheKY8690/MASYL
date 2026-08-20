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
  inArray,
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
  //전체 목록
  async findAll(userId: string) {
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

  //특정 카페의 할인 목록 (카페 상세페이지용 — active + 미만료만, 브랜드 할인 포함)
  async findByCafe(cafeId: string) {
    const now = new Date();

    // 해당 카페의 brand_id 조회
    const [cafe] = await this.db
      .select({ brandId: schema.cafes.brandId })
      .from(schema.cafes)
      .where(eq(schema.cafes.id, cafeId))
      .limit(1);

    const activeFilter = and(
      eq(schema.discounts.status, 'active'),
      or(
        isNull(schema.discounts.validUntil),
        gt(schema.discounts.validUntil, now),
      ),
    );

    return this.db
      .select()
      .from(schema.discounts)
      .where(
        and(
          activeFilter,
          or(
            eq(schema.discounts.cafeId, cafeId),
            cafe?.brandId
              ? eq(schema.discounts.brandId, cafe.brandId)
              : sql`false`,
          ),
        ),
      );
  }

  //내 위치 반경의 할인 조회 (active) — 브랜드 할인 + 지점별 할인 통합
  async findNearby({
    lat,
    lng,
    radius = 1,
    limit = 20,
    offset = 0,
  }: NearbyDiscountQueryDto) {
    const now = new Date();
    const latDelta = radius / 111.32;
    const lngDelta = radius / (111.32 * Math.cos((lat * Math.PI) / 180));

    // Step 1: 반경 내 카페 조회 (id + brand_id)
    const nearbyCafes = await this.db
      .select({
        id: schema.cafes.id,
        brandId: schema.cafes.brandId,
        name: schema.cafes.name,
        address: schema.cafes.address,
        latitude: schema.cafes.latitude,
        longitude: schema.cafes.longitude,
      })
      .from(schema.cafes)
      .where(
        and(
          sql`${schema.cafes.latitude}::float BETWEEN ${lat - latDelta} AND ${lat + latDelta}`,
          sql`${schema.cafes.longitude}::float BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}`,
          sql`6371 * acos(least(1,
            cos(radians(${lat})) * cos(radians(${schema.cafes.latitude}::float)) *
            cos(radians(${schema.cafes.longitude}::float) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(${schema.cafes.latitude}::float))
          )) <= ${radius}`,
        ),
      );

    if (nearbyCafes.length === 0) return [];

    const nearbyCafeIds = nearbyCafes.map((c) => c.id);
    const nearbyBrandIds = [
      ...new Set(nearbyCafes.map((c) => c.brandId).filter(Boolean) as string[]),
    ];

    // Step 2: 해당 카페/브랜드의 active 할인 조회
    const discountRows = await this.db
      .select({
        ...getTableColumns(schema.discounts),
        brandName: schema.brands.name,
      })
      .from(schema.discounts)
      .leftJoin(schema.brands, eq(schema.discounts.brandId, schema.brands.id))
      .where(
        and(
          eq(schema.discounts.status, 'active'),
          or(
            isNull(schema.discounts.validFrom),
            lte(schema.discounts.validFrom, now),
          ),
          or(
            isNull(schema.discounts.validUntil),
            gt(schema.discounts.validUntil, now),
          ),
          or(
            nearbyBrandIds.length > 0
              ? inArray(schema.discounts.brandId, nearbyBrandIds)
              : sql`false`,
            inArray(schema.discounts.cafeId, nearbyCafeIds),
          ),
        ),
      )
      .limit(limit)
      .offset(offset);

    // Step 3: 각 할인에 가장 가까운 카페 정보 첨부
    const cafeById = new Map(nearbyCafes.map((c) => [c.id, c]));
    const cafeByBrand = new Map(
      nearbyCafes.filter((c) => c.brandId).map((c) => [c.brandId!, c]),
    );

    return discountRows.map((d) => {
      const cafe = d.cafeId
        ? cafeById.get(d.cafeId)
        : d.brandId
          ? cafeByBrand.get(d.brandId)
          : undefined;
      return {
        ...d,
        cafeName: cafe?.name ?? d.brandName ?? null,
        cafeAddress: cafe?.address ?? null,
        cafeLatitude: cafe?.latitude ?? null,
        cafeLongitude: cafe?.longitude ?? null,
      };
    });
  }

  //할인 등록
  async create(dto: CreateDiscountDto, userId: string) {
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    const sourceType =
      profile?.role === 'admin'
        ? (dto.sourceType ?? 'user_report')
        : profile?.role === 'seller'
          ? 'seller_registered'
          : 'user_report';
    this.assertDateRange(dto.validFrom, dto.validUntil);
    const [discount] = await this.db
      .insert(schema.discounts)
      .values({
        brandId: dto.brandId ?? null,
        cafeId: dto.cafeId ?? null,
        title: dto.title,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        sourceType,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        createdBy: userId ?? null,
      })
      .returning();
    return discount;
  }

  //할인 수정
  async update(id: string, dto: UpdateDiscountDto, userId: string) {
    const existing = await this.findOneInternal(id);
    const [profile] = await this.db
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, userId))
      .limit(1);
    if (profile?.role !== 'admin' && existing.createdBy !== userId) {
      throw new ForbiddenException('수정 권한 없음');
    }
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

  //승인
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

  //거절
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
