<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project Overview

Next.js 16 App Router e-commerce application ("THRIFT.") using React 19, Prisma 7 (PostgreSQL), NextAuth v5 (beta), Zod v4, Tailwind CSS v4, and Cloudinary for image uploads.

## Build / Lint / Test Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Lint (ESLint v9 flat config)
npm run lint

# Type check (no dedicated script — use tsc directly)
npx tsc --noEmit

# Database migrations
npx prisma migrate dev
npx prisma migrate deploy

# Seed database
npx prisma db seed

# No test framework is currently configured. Do not write tests unless explicitly asked.
```

**Running a single lint check on a file:**
```bash
npx eslint app/path/to/file.tsx
```

## Architecture

- **App Router** with co-located Server Components and Client Components.
- **Server Actions** (`app/actions/`) handle user-facing mutations (auth, cart, checkout).
- **REST API Routes** (`app/api/`) handle admin CRUD and third-party callbacks (Khalti).
- **Prisma v7** uses the driver adapter pattern (`@prisma/adapter-pg` with `pg` Pool) — not the traditional Prisma engine.
- **NextAuth v5 beta** with Credentials provider. Supports guest sessions via cookie-based IDs; guest carts merge on login.

## Code Style

### File Naming

- React components: **PascalCase** (`CartManager.tsx`, `AddToCartForm.tsx`)
- Utilities, configs, schemas: **camelCase** (`auth.config.ts`, `schemas.ts`)
- Route files: standard Next.js conventions (`route.ts`, `page.tsx`, `layout.tsx`)

### Components

- **Server Components by default.** Only add `'use client'` when the component needs interactivity (state, effects, event handlers, browser APIs).
- Use **default exports** for components (`export default function Header()`).
- Co-locate client components alongside their parent route (e.g., `app/cart/CartManager.tsx`).
- Use `next/dynamic()` for client-only rendering (e.g., Leaflet map).

### Imports

- Use the `@/*` path alias for cross-directory imports: `import { prisma } from '@/lib/db'`
- Use relative imports only for same-directory files: `import CartItemComponent from './CartItem'`
- Group imports: React/Next.js first, then local modules, then third-party libraries.

### TypeScript

- `strict: true` — avoid `any`. Use Prisma-generated types directly (`Prisma.ProductWhereInput`).
- Define props inline or via small interfaces near the component.
- Use Zod for runtime validation of external input (forms, API bodies). Co-define types with `z.infer<typeof schema>`.

### Server Actions

- Place in `app/actions/` with `'use server'` at the top.
- Return result objects: `{ success: true }` or `{ error: string, details?: ... }`.
- Invalidate cache with `revalidatePath()` after mutations.

### API Routes

- Standard Next.js route handlers: `GET`, `POST`, `PATCH`, `DELETE` exports.
- Wrap handler body in try/catch. Return `NextResponse.json({ error }, { status })` on failure.
- Handle Prisma error codes: `P2002` (unique constraint), `P2025` (not found).

### Error Handling

- Server Actions return structured error objects — do not throw.
- API routes catch and return JSON error responses with appropriate HTTP status codes.
- Prisma errors should be caught and mapped to user-friendly messages.

### Styling

- **Tailwind CSS v4** utility-first. No CSS modules or styled-components.
- Tailwind v4 uses `@import "tailwindcss"` and `@theme inline` in `globals.css`.
- Design language: uppercase text, `tracking-widest`, `font-black`, monochrome (black/white/gray).
- Fonts: Geist Sans and Geist Mono via `next/font/google`.

### Forms

- Use React 19 `useActionState` for form state management in Client Components.
- Validate with Zod schemas before calling server actions.
- Display field-level errors from action responses.

## Key Files

| File | Purpose |
|------|---------|
| `lib/db.ts` | Prisma client singleton (pg Pool driver adapter) |
| `lib/auth.ts` | NextAuth config + Credentials provider |
| `lib/auth.config.ts` | JWT/session callbacks |
| `lib/session.ts` | Guest session ID management |
| `lib/schemas.ts` | Zod validation schemas (login, register, addToCart) |
| `lib/cloudinary.ts` | Cloudinary SDK config |
| `prisma/schema.prisma` | Database schema (10 models) |
| `middleware.ts` | Route protection (admin gate, session) |
| `app/actions/auth.ts` | login(), register() server actions |
| `app/actions/cart.ts` | getCart(), addToCart(), removeCartItem() |
| `app/actions/checkout.ts` | placeOrder() (COD + Khalti) |

## Environment Variables

`DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `KHALTI_SECRET_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `DB_STRING` (seed script).

## Conventions to Follow

1. Read `node_modules/next/dist/docs/` before making Next.js changes — APIs may differ from your training data.
2. Do not add dependencies without confirming they are needed and compatible.
3. Never commit secrets, API keys, or `.env` files.
4. Prefer Prisma client (`lib/db.ts`) over raw SQL.
5. Use existing Zod schemas in `lib/schemas.ts` for validation; add new schemas there.
6. Keep server and client boundaries clean — no direct DB access from Client Components.
7. Run `npm run lint` and `npx tsc --noEmit` before committing to catch errors.
