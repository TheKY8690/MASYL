import { z } from 'zod';
import { SocialProviderSchema } from './auth';

export const RoleSchema = z.enum(['user', 'admin', 'seller']);
export type Role = z.infer<typeof RoleSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  role: RoleSchema,
  provider: SocialProviderSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;
