import { z } from 'zod';

// 출처 구분. FE에서 신뢰도 배지 표시에 사용 ("공식" / "제보" / "자동수집")
export const DiscountSourceTypeSchema = z.enum([
  'auto_crawl',
  'user_report',
  'seller_registered',
]);

// 할인 유형. FE 카드 UI에서 아이콘/포맷 결정에 사용
// - percent: "10% 할인" / amount: "500원 할인" / free_item: "아메리카노 1잔 무료" / other: 기타
export const DiscountTypeSchema = z.enum([
  'percent',
  'amount',
  'free_item',
  'other',
]);

// 할인 상태. FE에서 active만 목록에 노출, admin 대시보드에서 pending_review 관리
// pending_review: 새로 생성, admin 검토 대기 중 (자동수집/사용자제보는 이 상태로 시작)
// active: 검토 완료, 앱에 노출 중
// expired: 유효기간 만료 또는 admin이 만료 처리
// rejected: admin이 거절 (허위정보, 중복 등)
export const DiscountStatusSchema = z.enum([
  'active',
  'expired',
  'pending_review',
  'rejected',
]);

/**
 * 할인 정보 엔티티 스키마.
 * 사용처: 주변 카페 할인 목록 API, 카페 상세 할인 탭, admin 검토 대시보드
 */
export const DiscountSchema = z.object({
  id: z.string().uuid(),
  cafeId: z.string().uuid(),
  title: z.string().max(200),
  description: z.string().nullable(),
  discountType: DiscountTypeSchema,
  discountValue: z.string().max(100), // "10%" / "500원" / "아메리카노 1잔"
  sourceType: DiscountSourceTypeSchema,
  status: DiscountStatusSchema,
  validFrom: z.string().datetime().nullable(), // null이면 즉시 유효
  validUntil: z.string().datetime().nullable(), // null이면 기간 무제한. 만료 스케줄러가 이 값 참조
  createdBy: z.string().uuid().nullable(), // auto_crawl이면 null
  verifiedAt: z.string().datetime().nullable(), // admin 검토 완료 시각
  verifiedBy: z.string().uuid().nullable(), // 검토한 admin profile id
  crawledEventId: z.string().uuid().nullable(), // auto_crawl이면 원본 이벤트 참조
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 판매자가 할인 직접 등록 시 / admin이 제보 승인 시 사용
export const CreateDiscountSchema = DiscountSchema.pick({
  cafeId: true,
  title: true,
  description: true,
  discountType: true,
  discountValue: true,
  validFrom: true,
  validUntil: true,
}).partial({ description: true, validFrom: true, validUntil: true });

export type Discount = z.infer<typeof DiscountSchema>;
export type CreateDiscount = z.infer<typeof CreateDiscountSchema>;
