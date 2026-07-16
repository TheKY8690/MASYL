import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async upsertUser(supabaseUser: {
    id: string;
    email: string;
    user_metadata: { name?: string; avatar_url?: string };
  }) {
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, supabaseUser.id))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [user] = await this.db
      .insert(schema.users)
      .values({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata.name ?? supabaseUser.email,
        avatarUrl: supabaseUser.user_metadata.avatar_url ?? null,
      })
      .returning();

    return user;
  }
}
