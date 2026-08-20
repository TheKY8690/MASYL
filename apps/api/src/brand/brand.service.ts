import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  findAll() {
    return this.db.select().from(schema.brands);
  }

  async findOne(id: string) {
    const [brand] = await this.db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.id, id))
      .limit(1);
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const [brand] = await this.db
      .insert(schema.brands)
      .values({
        name: dto.name,
        websiteUrl: dto.websiteUrl ?? null,
        logoUrl: dto.logoUrl ?? null,
      })
      .returning();
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    const [updated] = await this.db
      .update(schema.brands)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        updatedAt: new Date(),
      })
      .where(eq(schema.brands.id, id))
      .returning();
    if (!updated) throw new NotFoundException(`Brand ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await this.db
      .delete(schema.brands)
      .where(eq(schema.brands.id, id))
      .returning();
    if (!deleted) throw new NotFoundException(`Brand ${id} not found`);
    return deleted;
  }
}
