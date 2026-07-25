import { z } from 'zod';

/**
 * 카페 엔티티 스키마.
 * 사용처: 주변 카페 목록 API 응답, 카페 상세 페이지, 판매자 카페 등록 폼
 */
export const CafeSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid().nullable(), // seller가 등록한 카페. null이면 admin 등록
  name: z.string().max(100),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  websiteUrl: z.string().url().nullable(),
  instagramHandle: z.string().nullable(),
  kakaoPlaceId: z.string().nullable(),
  naverPlaceId: z.string().nullable(),
  isVerified: z.boolean(), // admin 인증 여부. FE에서 인증 배지 표시 여부 결정
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 판매자/admin이 카페 신규 등록 시 사용. id, isVerified, timestamps 제외
export const CreateCafeSchema = CafeSchema.pick({
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  phone: true,
  websiteUrl: true,
  instagramHandle: true,
  kakaoPlaceId: true,
  naverPlaceId: true,
}).partial({
  phone: true,
  websiteUrl: true,
  instagramHandle: true,
  kakaoPlaceId: true,
  naverPlaceId: true,
});

export const UpdateCafeSchema = CreateCafeSchema.partial();

export type Cafe = z.infer<typeof CafeSchema>;
export type CreateCafe = z.infer<typeof CreateCafeSchema>;
export type UpdateCafe = z.infer<typeof UpdateCafeSchema>;
