import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { AuthUser } from '@masyl/types';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async upsertUser(supabaseUser: AuthUser) {
    const existing = await this.db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, supabaseUser.id))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await this.db
        .update(schema.profiles)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.profiles.id, supabaseUser.id))
        .returning();
      return updated;
    }

    const [profile] = await this.db
      .insert(schema.profiles)
      .values({
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName:
          supabaseUser.user_metadata.full_name ??
          supabaseUser.user_metadata.name ??
          supabaseUser.email,
        avatarUrl: supabaseUser.user_metadata.avatar_url ?? null,
        provider: supabaseUser.app_metadata.provider as
          'google' | 'kakao' | 'naver',
      })
      .returning();

    return profile;
  }
}
