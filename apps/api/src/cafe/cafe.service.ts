import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import type { CreateCafeDto } from './dto/create-cafe.dto';
import type { UpdateCafeDto } from './dto/update-cafe.dto';
import type { NearbyQueryDto } from './dto/nearby-query.dto';

@Injectable()
export class CafeService {
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

  findAll() {
    return this.db.select().from(schema.cafes);
  }

  async findOne(id: string) {
    const [cafe] = await this.db
      .select()
      .from(schema.cafes)
      .where(eq(schema.cafes.id, id))
      .limit(1);

    if (!cafe) throw new NotFoundException(`Cafe ${id} not found`);
    return cafe;
  }

  findNearby({ lat, lng, radius = 1 }: NearbyQueryDto) {
    return this.db
      .select()
      .from(schema.cafes)
      .where(
        sql`
          6371 * acos(least(1,
            cos(radians(${lat})) * cos(radians(${schema.cafes.latitude}::float)) *
            cos(radians(${schema.cafes.longitude}::float) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(${schema.cafes.latitude}::float))
          )) <= ${radius}
        `,
      );
  }

  async create(dto: CreateCafeDto, ownerId?: string) {
    const [cafe] = await this.db
      .insert(schema.cafes)
      .values({
        ownerId: ownerId ?? null,
        name: dto.name,
        address: dto.address,
        latitude: String(dto.latitude),
        longitude: String(dto.longitude),
        phone: dto.phone ?? null,
        websiteUrl: dto.websiteUrl ?? null,
        instagramHandle: dto.instagramHandle ?? null,
        kakaoPlaceId: dto.kakaoPlaceId ?? null,
        naverPlaceId: dto.naverPlaceId ?? null,
      })
      .returning();
    return cafe;
  }

  async update(id: string, dto: UpdateCafeDto) {
    const values: Partial<typeof schema.cafes.$inferInsert> = {};

    if (dto.name !== undefined) values.name = dto.name;
    if (dto.address !== undefined) values.address = dto.address;
    if (dto.latitude !== undefined) values.latitude = String(dto.latitude);
    if (dto.longitude !== undefined) values.longitude = String(dto.longitude);
    if (dto.phone !== undefined) values.phone = dto.phone;
    if (dto.websiteUrl !== undefined) values.websiteUrl = dto.websiteUrl;
    if (dto.instagramHandle !== undefined)
      values.instagramHandle = dto.instagramHandle;
    if (dto.kakaoPlaceId !== undefined) values.kakaoPlaceId = dto.kakaoPlaceId;
    if (dto.naverPlaceId !== undefined) values.naverPlaceId = dto.naverPlaceId;

    const [updated] = await this.db
      .update(schema.cafes)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.cafes.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Cafe ${id} not found`);
    return updated;
  }

  async remove(id: string, adminId: string) {
    await this.assertAdmin(adminId);
    const [deleted] = await this.db
      .delete(schema.cafes)
      .where(eq(schema.cafes.id, id))
      .returning();

    if (!deleted) throw new NotFoundException(`Cafe ${id} not found`);
    return deleted;
  }
}
