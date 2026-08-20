import { sql } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

// 기존 user|admin에 seller 추가.
// seller: 카페 소유주. 자신의 카페 할인을 직접 등록할 수 있는 권한.
export const roleEnum = pgEnum('role', ['user', 'admin', 'seller']);
// 소셜 로그인 제공자. Supabase Auth 소셜 로그인 전용 (이메일/비밀번호 없음).
export const providerEnum = pgEnum('provider', ['google', 'kakao']);

/**
 * [사용처] 브랜드 정보. 체인 카페 브랜드 단위로 이벤트 크롤링 소스 관리.
 * - 크롤러가 website_url을 기준으로 이벤트 수집
 * - 수집된 할인은 brand_id로 연결 → 전국 해당 브랜드 지점 모두에 적용
 */
export const brands = pgTable(
  'brands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(), // 브랜드명. 크롤러 식별자
    websiteUrl: varchar('website_url', { length: 500 }), // 크롤링 대상 이벤트 페이지 URL
    logoUrl: varchar('logo_url', { length: 500 }), // 브랜드 로고. 앱 UI 표시용
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('brands select for authenticated', {
      for: 'select',
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy('brands write for admin', {
      for: 'all',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ],
);

/**
 * [사용처] 4대 기능 모두의 중심 엔티티. 개별 카페 지점.
 * - 기능1(주변카페조회): latitude/longitude 기반 반경 내 카페 검색
 * - 기능3(사용자제보): 제보 대상 카페 특정
 * - 기능4(판매자등록): owner_id = seller profile, 본인 카페의 할인만 등록 가능
 * - brand_id: 체인 브랜드 소속이면 FK. null이면 독립 카페.
 */
export const cafes = pgTable(
  'cafes',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // 판매자가 직접 등록한 카페의 경우 seller profile id. null이면 어드민이 등록한 카페.
    ownerId: uuid('owner_id').references(() => profiles.id),

    // 체인 브랜드 소속이면 brands.id FK. null이면 독립 카페.
    brandId: uuid('brand_id').references(() => brands.id),

    name: varchar('name', { length: 100 }).notNull(), // 카페 이름. 검색/목록 표시용
    address: text('address').notNull(), // 도로명 주소. 상세 페이지 표시용
    latitude: numeric('latitude', { precision: 10, scale: 7 }).notNull(), // 위도. 주변 카페 거리 계산에 사용
    longitude: numeric('longitude', { precision: 10, scale: 7 }).notNull(), // 경도. 주변 카페 거리 계산에 사용
    phone: varchar('phone', { length: 20 }), // 전화번호. 상세 페이지 표시용. nullable

    // 자동 이벤트 수집 소스 식별자. 각 플랫폼별 크롤러가 이 값을 키로 수집 대상 결정
    websiteUrl: varchar('website_url', { length: 500 }), // 크롤링 대상 공식 웹사이트 URL
    instagramHandle: varchar('instagram_handle', { length: 100 }), // 인스타그램 @계정명. API/크롤링 대상
    kakaoPlaceId: varchar('kakao_place_id', { length: 100 }), // 카카오맵 place id. 카카오 API 호출 키
    naverPlaceId: varchar('naver_place_id', { length: 100 }), // 네이버 플레이스 id. 네이버 API 호출 키

    // admin이 카페 정보 실제 존재/정확성 검증 후 true로 변경. 미인증 카페는 UI에서 경고 표시.
    isVerified: boolean('is_verified').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // 인증된 사용자 전체 조회 가능 (주변 카페 검색)
    pgPolicy('cafes select for authenticated', {
      for: 'select',
      to: authenticatedRole,
      using: sql`true`,
    }),
    // seller는 자신이 owner인 카페만 등록, admin은 모두 등록 가능
    pgPolicy('cafes insert for seller or admin', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${table.ownerId} OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // seller는 자신의 카페만 수정, admin은 모두 수정 가능
    pgPolicy('cafes update for owner or admin', {
      for: 'update',
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.ownerId} OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // 삭제는 admin만
    pgPolicy('cafes delete for admin', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ],
);

// 할인 정보가 어디서 왔는지 출처 구분
// - auto_crawl: 크롤러가 자동 수집 → crawled_events 처리 결과
// - user_report: 일반 사용자가 직접 제보 → user_reports 승인 결과
// - seller_registered: 판매자(seller role)가 직접 입력
export const discountSourceTypeEnum = pgEnum('discount_source_type', [
  'auto_crawl',
  'user_report',
  'seller_registered',
]);

// 할인 유형. UI에서 적절한 형식으로 표시하기 위해 구분
// - percent: "10% 할인" / amount: "500원 할인" / free_item: "아메리카노 1잔 무료" / coupon: "앱 쿠폰/증정 쿠폰" / other: 기타
export const discountTypeEnum = pgEnum('discount_type', [
  'percent',
  'amount',
  'free_item',
  'coupon',
  'other',
]);

// 할인 정보 상태 머신
// pending_review: 새로 생성, admin 검토 대기 중 (자동수집/사용자제보는 이 상태로 시작)
// active: 검토 완료, 앱에 노출 중
// expired: 유효기간 만료 또는 admin이 만료 처리
// rejected: admin이 거절 (허위정보, 중복 등)
export const discountStatusEnum = pgEnum('discount_status', [
  'active',
  'expired',
  'pending_review',
  'rejected',
]);

/**
 * [사용처] 앱의 핵심 데이터. 모든 할인 정보가 이 테이블에 통합 저장.
 * - 기능1(주변카페조회): cafe_id로 JOIN, status='active'인 것만 노출
 * - 기능2(자동수집): crawled_event_id로 crawled_events와 연결, source_type='auto_crawl'
 * - 기능3(사용자제보): source_type='user_report', user_reports 승인 시 이 테이블에 생성
 * - 기능4(판매자등록): source_type='seller_registered', created_by = seller profile id
 */
export const discounts = pgTable(
  'discounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // 브랜드 전체 적용 할인 (auto_crawl). brand_id OR cafe_id 둘 중 하나는 반드시 존재.
    brandId: uuid('brand_id').references(() => brands.id),
    // 특정 지점 할인 (user_report, seller_registered). brand_id가 있으면 null 가능.
    cafeId: uuid('cafe_id').references(() => cafes.id),

    title: varchar('title', { length: 200 }).notNull(), // 할인명. 목록/카드 UI에 표시
    description: text('description'), // 상세 설명. 상세 페이지에 표시. nullable

    discountType: discountTypeEnum('discount_type').notNull(), // 할인 유형 (percent/amount/free_item/other)
    discountValue: varchar('discount_value', { length: 100 }).notNull(), // 할인 값. "10%" / "500원" / "아메리카노 1잔"

    // 이벤트 원본 페이지 URL. 상세보기 외부 링크로 사용. auto_crawl 시 LLM이 추출.
    eventUrl: varchar('event_url', { length: 500 }),

    sourceType: discountSourceTypeEnum('source_type').notNull(), // 출처 구분. 신뢰도 배지 표시에 활용
    status: discountStatusEnum('status').default('pending_review').notNull(), // 현재 상태. 앱 노출 여부 결정

    validFrom: timestamp('valid_from'), // 할인 시작일. null이면 즉시 유효
    validUntil: timestamp('valid_until'), // 할인 종료일. null이면 기간 무제한. 만료 스케줄러가 이 값 참조

    // 누가 등록했는지. auto_crawl이면 null (크롤러 등록). seller/user_report이면 profiles.id
    createdBy: uuid('created_by').references(() => profiles.id),

    // admin 검토 정보. pending_review → active/rejected 전환 시 기록
    verifiedAt: timestamp('verified_at'), // 검토 완료 시각
    verifiedBy: uuid('verified_by').references(() => profiles.id), // 검토한 admin profile id

    // 자동 수집인 경우, 원본 크롤링 이벤트 참조. 원문/출처 확인 시 사용
    // circular reference 방지: crawled_events 테이블 선언 전이므로 FK constraint는 migration에서 처리
    crawledEventId: uuid('crawled_event_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // active 상태 할인만 일반 사용자 조회 가능. admin은 전체 조회.
    pgPolicy('discounts select for authenticated', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.status} = 'active' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // seller/user_report 경로: created_by = 본인. admin은 모두 등록.
    pgPolicy('discounts insert for authenticated', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${table.createdBy} OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // 본인이 등록한 할인 또는 admin만 수정
    pgPolicy('discounts update for owner or admin', {
      for: 'update',
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.createdBy} OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // 삭제는 admin만
    pgPolicy('discounts delete for admin', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ],
);

// 수집 소스 플랫폼. 크롤러 종류 구분 및 출처 표시에 사용
export const crawledEventSourceTypeEnum = pgEnum('crawled_event_source_type', [
  'website',
  'instagram',
  'kakao_map',
  'naver_place',
]);

// LLM 처리 파이프라인 상태
// pending: 크롤러 수집 완료, LLM 처리 대기
// processed: LLM 처리 완료, discount 생성됨
// failed: LLM 처리 실패, 재처리 큐 대상
export const crawledEventStatusEnum = pgEnum('crawled_event_status', [
  'pending',
  'processed',
  'failed',
]);

/**
 * [사용처] 기능2 (자동 이벤트 정보수집 및 요약) 전용 테이블.
 * 크롤러/수집 워커가 외부 소스에서 가져온 원시 데이터를 저장.
 * LLM 요약 처리 파이프라인의 input/output 저장소.
 *
 * 처리 흐름:
 * 크롤러 실행 → raw_content 저장 (status='pending')
 * → LLM 요약 워커 → summary 저장, discount 생성 (status='processed', discount_id 연결)
 * → 실패 시 status='failed', 재처리 큐로
 */
export const crawledEvents = pgTable(
  'crawled_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    brandId: uuid('brand_id')
      .references(() => brands.id)
      .notNull(), // 어느 브랜드 소스에서 수집했는지

    // 수집 소스 플랫폼. 크롤러 종류 구분 및 출처 표시에 사용
    sourceType: crawledEventSourceTypeEnum('source_type').notNull(),

    sourceUrl: text('source_url').notNull(), // 수집한 원본 URL (웹페이지, 인스타 게시물, 플레이스 링크 등)
    rawContent: text('raw_content').notNull(), // 크롤러가 수집한 원시 텍스트/HTML. LLM 처리 input

    // LLM이 raw_content에서 추출한 할인 정보 요약. discount.description으로 복사됨.
    // null이면 아직 LLM 처리 전 또는 처리 실패
    summary: text('summary'),

    status: crawledEventStatusEnum('status').default('pending').notNull(),

    processedAt: timestamp('processed_at'), // LLM 처리 완료 시각. null이면 미처리

    // LLM 처리 결과로 생성된 discount 레코드. null이면 미처리 또는 할인 정보 없음으로 판단
    discountId: uuid('discount_id').references(() => discounts.id),

    collectedAt: timestamp('collected_at').defaultNow().notNull(), // 크롤러가 수집한 시각
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  () => [
    // 수집 데이터는 admin만 접근 (크롤러는 service_role로 동작하여 RLS 우회)
    pgPolicy('crawled events admin only', {
      for: 'all',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ],
);

// 제보 검토 상태
// pending: 제보 접수, admin 검토 대기
// approved: admin 승인 → discounts 테이블에 신규 레코드 생성됨
// rejected: admin 거절 → reject_reason 기록됨
export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'approved',
  'rejected',
]);

/**
 * [사용처] 기능3 (사용자 제보로 할인정보 보완) 전용 테이블.
 * 일반 사용자가 앱에서 제보한 할인 정보 임시 저장소.
 *
 * 처리 흐름:
 * 사용자 제보 → status='pending' 저장
 * → admin 검토 → approved: discounts 테이블에 신규 레코드 생성 (source_type='user_report')
 *                rejected: reject_reason 기록
 */
export const userReports = pgTable(
  'user_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cafeId: uuid('cafe_id')
      .references(() => cafes.id)
      .notNull(), // 제보 대상 카페
    reporterId: uuid('reporter_id')
      .references(() => profiles.id)
      .notNull(), // 제보한 사용자

    // 기존 할인 정보에 보완 제보 시 연결. null이면 새 할인 정보 제보
    discountId: uuid('discount_id').references(() => discounts.id),

    content: text('content').notNull(), // 제보 본문. 어떤 할인인지 사용자가 작성한 텍스트

    // 제보자가 첨부한 증빙 이미지 URL 배열 (영수증, 이벤트 포스터 등). Supabase Storage URL
    imageUrls: text('image_urls').array(),

    status: reportStatusEnum('status').default('pending').notNull(),

    // admin 검토 결과 기록
    reviewedBy: uuid('reviewed_by').references(() => profiles.id), // 검토한 admin profile id
    reviewedAt: timestamp('reviewed_at'), // 검토 완료 시각
    rejectReason: text('reject_reason'), // 거절 사유. rejected 상태일 때만 기록

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // 본인 제보 또는 admin 조회
    pgPolicy('user reports select for reporter or admin', {
      for: 'select',
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.reporterId} OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // 본인 reporter_id로만 제보 등록
    pgPolicy('user reports insert for authenticated', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${table.reporterId}`,
    }),
    // 상태 변경(승인/거절)은 admin만
    pgPolicy('user reports update for admin', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
    // 삭제는 admin만
    pgPolicy('user reports delete for admin', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`,
    }),
  ],
);

/**
 * [사용처] 인증 및 권한 관리의 중심 엔티티.
 * - Supabase auth.users와 1:1 동기화. 소셜 로그인 시 upsert.
 * - role 필드로 user/admin/seller 접근 제어 (RolesGuard + RLS 양쪽에서 참조)
 * - 모든 테이블의 created_by, owner_id, reporter_id 등이 이 테이블의 id를 FK로 참조
 */
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // Supabase auth.users.id와 동기화. 별도 생성 없이 auth uid 그대로 사용
    email: varchar('email', { length: 255 }).notNull().unique(), // 소셜 계정 이메일. 로그인 식별자
    displayName: varchar('display_name', { length: 255 }).notNull(), // 표시 이름. user_metadata.full_name 또는 name에서 가져옴
    avatarUrl: varchar('avatar_url', { length: 500 }), // 프로필 이미지 URL. user_metadata.avatar_url. nullable
    role: roleEnum('role').notNull().default('user'), // 접근 권한. user(일반)/admin(전체)/seller(카페 소유주). 기본값 user
    provider: providerEnum('provider').notNull(), // 소셜 로그인 제공자. app_metadata.provider에서 가져옴
    createdAt: timestamp('created_at').notNull().defaultNow(), // 최초 가입 시각
    updatedAt: timestamp('updated_at').notNull().defaultNow(), // 프로필 정보 변경 시각
    lastLoginAt: timestamp('last_login_at').notNull().defaultNow(), // 마지막 로그인 시각. 로그인마다 갱신
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
