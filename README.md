# Masyl

- Start date: 2026-07-16
- Company: TheKYP

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend** (`apps/api`): NestJS, Drizzle ORM, PostgreSQL, JWT Auth
- **Frontend** (`apps/web`): Next.js App Router, vanilla-extract CSS, TanStack Query, PWA
- **Admin** (`apps/admin`): Next.js App Router, vanilla-extract CSS, TanStack Query

## Packages

- `packages/ui` — Shared UI components
- `packages/types` — Shared types + Zod schemas
- `packages/config` — Shared tsconfig, eslint configs

## Getting Started

```bash
pnpm install
pnpm dev
```
