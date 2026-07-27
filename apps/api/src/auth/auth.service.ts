import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { AuthUser } from '@masyl/types';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async upsertUser(supabaseUser: AuthUser) {
    const email = supabaseUser.email ?? supabaseUser.user_metadata?.email;
    if (!email) {
      throw new BadRequestException('이메일을 제공하지 않은 계정입니다');
    }

    const rawProvider = supabaseUser.app_metadata?.provider;
    const validProvider = ['google', 'kakao'] as const;
    if (
      !validProvider.includes(rawProvider as (typeof validProvider)[number])
    ) {
      throw new BadRequestException(
        `지원하지 않는 로그인 방식: ${rawProvider}`,
      );
    }

    const provider = rawProvider as 'google' | 'kakao';

    const displayName =
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      email;
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
        email,
        displayName,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
        provider,
      })
      .returning();

    return profile;
  }
}
