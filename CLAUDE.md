# CLAUDE.md

Masyl 프로젝트에서 작업할 때 반드시 지켜야 하는 규칙.

## 1. 작업 우선순위 — packages/ 먼저 확인

새 코드를 짜기 전에 아래 순서로 먼저 확인할 것. **여러 앱에서 쓰일 가능성이 있는 코드는 앱 폴더(apps/web, apps/admin, apps/api) 안에 만들지 말고 처음부터 packages/에 만든다.**

1. `packages/config` — tsconfig, eslint 공유 설정. 새 설정을 만들기 전에 여기 먼저 확인하고, 없으면 여기에 추가한 뒤 각 앱에서 extends
2. `packages/types` — Zod 스키마 + 추론 타입. API/FE 공통으로 쓰는 타입/DTO는 새로 만들지 말고 여기서 가져다 쓴다. 없으면 여기에 추가
3. `packages/ui` — 공유 UI 컴포넌트. web/admin에서 반복되는 컴포넌트는 각 앱에 두지 말고 여기로 옮긴다

## 2. 프론트엔드 컨벤션 (apps/web, apps/admin)

- **SSR 우선**: 가능하면 Server Component에서 데이터를 가져온다. `'use client'`는 실제로 상호작용(이벤트 핸들러, 로컬 상태, 브라우저 API)이 필요한 최소 범위에만 사용
- **Hook 분리**: 컴포넌트 안에 데이터 페칭/상태 로직이 반복되거나 복잡해지면 `useXxx` 커스텀 훅으로 분리해서 별도 파일로 관리. 컴포넌트는 UI 렌더링에 집중

## 3. 기술 스택 (임의로 변경 금지)

아래는 이미 확정된 결정이다. 다른 라이브러리로 바꾸거나 이전 버전으로 되돌리지 말 것.

- 모노레포: Turborepo + pnpm workspace
- 백엔드: NestJS + Drizzle ORM + PostgreSQL (Supabase 호스팅)
- 인증: **Supabase Auth, 소셜 로그인 전용** (Google, Kakao, Naver). 이메일/비밀번호 폼이나 자체 JWT 발급 로직을 만들지 않는다. `apps/api`는 Supabase가 발급한 JWT를 검증만 한다 (`passport-jwt` + `SUPABASE_JWT_SECRET`)
- role 기반 접근 제어: `profiles.role`(user/admin), `RolesGuard` + `@Roles()`로 admin 전용 엔드포인트 보호
- 프론트: Next.js 16 App Router, vanilla-extract (+ `@vanilla-extract/next-plugin` 등록 필수), TanStack Query v5
- PWA: `@serwist/next` 사용. **`next-pwa`는 사용 금지** (유지보수 중단됨)
- 코드 포맷: Prettier. lint-staged는 **prettier만** 실행 (ESLint는 lint-staged에서 제외, CI와 pre-push-pr 스킬에서 처리)

## 4. Git 작업 규칙

- **Claude는 `git commit`, `git push`를 스스로 실행하지 않는다.** 코드 수정까지만 하고, 커밋/푸시는 사용자에게 직접 하도록 안내한다
- push 전 검증(lint/typecheck/build/test)과 PR 본문 작성이 필요하면 `pre-push-pr` 스킬을 사용한다
