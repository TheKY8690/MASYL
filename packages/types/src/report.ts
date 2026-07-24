import { z } from 'zod';

// 제보 검토 상태. admin 대시보드 필터링 및 사용자에게 제보 처리 상태 표시에 사용
// pending: 제보 접수, admin 검토 대기
// approved: admin 승인 → discounts 테이블에 신규 레코드 생성됨
// rejected: admin 거절 → reject_reason 기록됨
export const ReportStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * 사용자 제보 스키마.
 * 사용처: 제보 폼(CreateReportSchema), admin 검토 대시보드, 사용자 내 제보 내역
 */
export const UserReportSchema = z.object({
  id: z.string().uuid(),
  cafeId: z.string().uuid(),
  reporterId: z.string().uuid(),
  discountId: z.string().uuid().nullable(), // 기존 할인 보완 제보면 연결, 새 제보면 null
  content: z.string(), // 제보 본문. 어떤 할인인지 사용자가 작성한 텍스트
  imageUrls: z.array(z.string().url()).nullable(), // 증빙 이미지. Supabase Storage URL 배열
  status: ReportStatusSchema,
  reviewedBy: z.string().uuid().nullable(), // 검토한 admin profile id
  reviewedAt: z.string().datetime().nullable(),
  rejectReason: z.string().nullable(), // rejected 상태일 때만 값 있음
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 사용자가 제보 폼에서 입력하는 필드만 포함
export const CreateReportSchema = UserReportSchema.pick({
  cafeId: true,
  discountId: true,
  content: true,
  imageUrls: true,
}).partial({ discountId: true, imageUrls: true });

export type UserReport = z.infer<typeof UserReportSchema>;
export type CreateReport = z.infer<typeof CreateReportSchema>;
