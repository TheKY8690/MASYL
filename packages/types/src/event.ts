import { z } from 'zod';

// 수집 소스 플랫폼. 크롤러 종류 식별 및 FE 출처 표시에 사용
export const CrawledEventSourceTypeSchema = z.enum([
  'website',
  'instagram',
  'kakao_map',
  'naver_place',
]);

// 처리 파이프라인 상태. admin 대시보드에서 수집 현황 모니터링
// pending: 크롤러 수집 완료, LLM 처리 대기
// processed: LLM 처리 완료, discount 생성됨
// failed: LLM 처리 실패, 재처리 큐 대상
export const CrawledEventStatusSchema = z.enum([
  'pending',
  'processed',
  'failed',
]);

/**
 * 자동 수집 이벤트 스키마.
 * 사용처: admin 수집 현황 대시보드, LLM 처리 워커 API, 원본 소스 추적
 */
export const CrawledEventSchema = z.object({
  id: z.string().uuid(),
  cafeId: z.string().uuid(),
  sourceType: CrawledEventSourceTypeSchema,
  sourceUrl: z.string().url(), // 원본 링크. 클릭 시 소스 확인 가능
  rawContent: z.string(), // 크롤러 수집 원문. LLM 처리 input
  summary: z.string().nullable(), // LLM 요약 결과. null이면 미처리
  status: CrawledEventStatusSchema,
  processedAt: z.string().datetime().nullable(), // null이면 미처리
  discountId: z.string().uuid().nullable(), // 처리 후 생성된 discount 참조. null이면 미처리 또는 할인정보 없음
  collectedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type CrawledEvent = z.infer<typeof CrawledEventSchema>;
