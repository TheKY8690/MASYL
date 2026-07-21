import { z } from 'zod';

export const SocialProviderSchema = z.enum(['google', 'kakao', 'naver']);
export type SocialProvider = z.infer<typeof SocialProviderSchema>;

// Supabase auth.getUser() 반환값 기준
export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  app_metadata: z.object({
    provider: SocialProviderSchema,
  }),
  user_metadata: z.object({
    full_name: z.string().optional(),
    name: z.string().optional(),
    avatar_url: z.string().optional(),
  }),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;
