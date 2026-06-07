# Route Protection — Implementation Plan

## Context
The app has no route guards. Authenticated dashboard pages (`/heists*`) are publicly accessible, and public auth pages (`/login`, `/signup`) are accessible even when logged in. This causes incorrect UX and potential security issues. We need to wire both route-group layouts to the existing `useUser` hook so auth state gates access and shows a spinner while Firebase resolves.

The spec also requires a `?redirect=` param: when an unauthenticated user hits a dashboard URL, they land on `/login?redirect=/that/path` and after login are sent back there.

---

## What to Build

### 1. Spinner component (new)
**Files to create:**
- `components/Spinner/index.ts`
- `components/Spinner/Spinner.tsx`

A full-page centered spinner using existing theme tokens (`primary` color). Matches the project's component folder convention. Used by both layouts while auth is resolving.

### 2. Dashboard layout — add auth guard
**File:** `app/(dashboard)/layout.tsx`

- Add `"use client"` directive (required to use hooks).
- Import `useUser`, `useRouter`, `usePathname` from `next/navigation`.
- In a `useEffect`, when `!loading && !user`: call `router.replace("/login?redirect=" + encodeURIComponent(pathname))`.
- While `loading` is true **or** the user is null (redirect about to fire): return `<Spinner />` instead of children — prevents any flash of protected content.
- When `!loading && user`: render the existing `<Navbar /> + <main>{children}</main>` structure unchanged.

### 3. Public layout — add auth guard + redirect param
**File:** `app/(public)/layout.tsx`

- Add `"use client"` directive.
- Import `useUser` and `useRouter`.
- In a `useEffect`, when `!loading && user`: read `window.location.search` for a `?redirect=` param, validate it starts with `/`, and call `router.replace(redirect || "/heists")`. Using `window.location.search` inside `useEffect` avoids the Next.js `useSearchParams()` Suspense requirement.
- While `loading` or while user is authenticated (redirect about to fire): return `<Spinner />`.
- When `!loading && !user`: render the existing `<main className="public">{children}</main> + <Footer />` structure unchanged.

---

## Files Modified / Created

| File | Action |
|------|--------|
| `components/Spinner/Spinner.tsx` | Create — full-page spinner |
| `components/Spinner/index.ts` | Create — barrel export |
| `app/(dashboard)/layout.tsx` | Modify — add `"use client"` + auth guard |
| `app/(public)/layout.tsx` | Modify — add `"use client"` + auth guard |
| `tests/layouts/DashboardLayout.test.tsx` | Create — layout tests |
| `tests/layouts/PublicLayout.test.tsx` | Create — layout tests |

---

## Key Reuse

- `useUser` hook from `components/UserProvider/UserProvider.tsx` — returns `{ user, loading }`.
- `useRouter`, `usePathname` from `next/navigation` — same pattern as AuthForm (`components/AuthForm/AuthForm.tsx`).
- Theme token `primary` for spinner color — consistent with `.btn` styling in `app/globals.css`.

---

## Testing

**Mock strategy** (mirrors `tests/components/Navbar.test.tsx` pattern):
```
vi.mock("@/components/UserProvider/UserProvider", () => ({ useUser: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }), usePathname: () => "/heists" }))
```

**Test cases per layout:**
- Dashboard: redirects to `/login` when `{ user: null, loading: false }`
- Dashboard: renders children when `{ user: mockUser, loading: false }`
- Dashboard: renders spinner when `{ user: null, loading: true }`
- Public: redirects to `/heists` when `{ user: mockUser, loading: false }`
- Public: renders children when `{ user: null, loading: false }`
- Public: renders spinner when `{ user: null, loading: true }`

**Run tests:** `npx vitest run tests/layouts/`

**Manual verification:**
1. `npm run dev`
2. While logged out, visit `localhost:3000/heists` → should redirect to `/login`
3. While logged in, visit `localhost:3000/login` → should redirect to `/heists`
4. Visit `localhost:3000/heists/create` while logged out → should redirect to `/login?redirect=/heists/create`, then after login land on `/heists/create`
5. On a slow connection, the spinner should be visible before redirect fires
