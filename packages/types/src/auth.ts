import { z } from 'zod';

export const SocialProviderSchema = z.enum(['google', 'kakao', 'toss']);
export type SocialProvider = z.infer<typeof SocialProviderSchema>;

/** 웹 유저 로그인. 토스 미니앱은 로그인하지 않음. */
export const WEB_LOGIN_PROVIDERS = ['google'] as const;
export type WebLoginProvider = (typeof WEB_LOGIN_PROVIDERS)[number];

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
