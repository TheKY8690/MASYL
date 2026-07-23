import { sql } from 'drizzle-orm';
import {
  pgEnum,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const providerEnum = pgEnum('provider', ['google', 'kakao', 'naver']);

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // Supabase auth.users.id와 동기화
    email: varchar('email', { length: 255 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: roleEnum('role').notNull().default('user'),
    provider: providerEnum('provider').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at').notNull().defaultNow(),
  },
  (table) => [
    pgPolicy('users can view own profile', {
      for: 'select',
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.id}`,
    }),
    pgPolicy('users can update own profile', {
      for: 'update',
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.id}`,
    }),
  ],
);
