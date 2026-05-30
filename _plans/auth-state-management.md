# Plan: Auth State Management (`useUser`)

## Context

Pocket Heist has Firebase Auth wired up (`lib/firebase.ts` exports `auth`) and login/signup forms, but **no app-wide notion of "who is logged in."** Nothing in the UI reacts to auth state: the Navbar is a server component with no user, and `Avatar` is demo-only on `/preview`.

This feature adds a single source of truth for the current user: one global, real-time `onAuthStateChanged` listener feeding a React context, read anywhere via a `useUser()` hook (`null` when logged out, a trimmed user object when logged in). Scope is the **read/listener side only** — no login/signup/logout logic. As the one real consumer, the Navbar will show the logged-in user's Avatar.

Spec: `_specs/auth-state-management.md`. Branch: `claude/feature/auth-state-management` (already checked out).

### Decisions (confirmed with user)
- **Consumer scope:** hook + provider **and** wire the Navbar to show the user's Avatar.
- **User model (`AppUser`):** `uid` + `email` only. Avatar initials derive from `email`.
- **Provider location:** root `app/layout.tsx` (covers both route groups), via a `"use client"` wrapper so the layout stays a Server Component.
- **Outside-provider behavior:** `useUser` throws a clear error.

## File tree

```
lib/auth/
  types.ts            # AppUser + UserContextValue types
  mapUser.ts          # mapFirebaseUser(User | null): AppUser | null  (pure)
components/UserProvider/
  UserProvider.tsx    # "use client" — context + provider + listener + useUser hook
  index.ts            # barrel: export { default, useUser } from "./UserProvider"
tests/
  lib/mapUser.test.ts          # pure mapper unit tests (no firebase mock)
  components/UserProvider.test.tsx  # provider/hook behavior (vi.mock firebase/auth)
```

## Design

### `lib/auth/types.ts`
```ts
export interface AppUser { uid: string; email: string | null }
export interface UserContextValue { user: AppUser | null; loading: boolean }
```

### `lib/auth/mapUser.ts` (pure, framework-agnostic)
```ts
import type { User } from "firebase/auth"
import type { AppUser } from "./types"
export function mapFirebaseUser(user: User | null): AppUser | null {
  return user ? { uid: user.uid, email: user.email } : null
}
```
Mapping happens **once inside the listener callback**, so context never stores a raw Firebase `User`.

### `components/UserProvider/UserProvider.tsx` (`"use client"`)
- Module-level `const UserContext = createContext<UserContextValue | undefined>(undefined)` — `undefined` default lets the hook detect "no provider" while still allowing a legitimately-`null` user.
- State seeded `{ user: null, loading: true }`.
- One `useEffect(() => onAuthStateChanged(auth, fb => setState({ user: mapFirebaseUser(fb), loading: false })), [])` — empty deps = exactly one listener; returning the `Unsubscribe` cleans up on unmount.
- `useUser()`: reads context; `if (ctx === undefined) throw new Error("useUser must be used within a UserProvider")`.
- Barrel `index.ts`: `export { default, useUser } from "./UserProvider"`. Keeping the hook co-located with the context guarantees a single context identity. Consumers import `import { useUser } from "@/components/UserProvider"`.

### Root layout integration — `app/layout.tsx`
Keep it a Server Component. Wrap children:
```tsx
import UserProvider from "@/components/UserProvider"
// ...
<body>
  <UserProvider>{children}</UserProvider>
</body>
```
`UserProvider` carries `"use client"`, so only the provider subtree is client-rendered; `<html>/<body>` and the `metadata` export stay server-side. Server-rendered route children passed as `children` are not forced to client. (Standard App Router pattern; verified fine for Next 16 / React 19. A separate `AppProviders` composition file is optional and not needed for a single provider.)

### Navbar wiring — `components/Navbar/Navbar.tsx`
- Add `"use client"` (it currently has no client logic, so this is safe).
- Read `const { user, loading } = useUser()`.
- Render an Avatar area in the header:
  - `loading` → render the existing `Skeleton` placeholder.
  - `user` present → `<Avatar name={user.email ?? "?"} />`.
  - logged out (`!loading && !user`) → hide user-specific items (no Avatar).
- `Avatar` is unchanged — it already takes `name: string` and computes initials; email like `ahmad.hwry@gmail.com` yields `A`.

Reuse: existing `Skeleton` (`@/components/Skeleton`) and `Avatar` (`@/components/Avatar`) components — no new placeholder/UI primitives.

## Tests (Vitest + jsdom, globals on, `@testing-library/react@16.3.0` has `renderHook`)

This introduces the **first `vi.mock` in the repo**.

### `tests/lib/mapUser.test.ts` (no mock)
- `mapFirebaseUser(null)` → `null`.
- Maps a Firebase-shaped object to `{ uid, email }`, dropping all extra fields.
- Passes through `null` email.

### `tests/components/UserProvider.test.tsx`
Mock strategy — capture the registered callback and drive it manually; use `vi.hoisted` for the unsubscribe spy to avoid Vitest's hoisting trap:
```ts
const { unsubscribe } = vi.hoisted(() => ({ unsubscribe: vi.fn() }))
let registeredCallback: ((u: unknown) => void) | null = null
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_a, cb) => { registeredCallback = cb; return unsubscribe }),
  getAuth: vi.fn(() => ({})),
}))
vi.mock("@/lib/firebase", () => ({ auth: {} })) // avoid real initializeApp in jsdom
beforeEach(() => { registeredCallback = null; vi.clearAllMocks() })
```
Cases (via `renderHook(() => useUser(), { wrapper: UserProvider })` + `act`):
1. `loading` true / `user` null before first callback; after `act(() => registeredCallback(null))` → `loading` false.
2. Logged out: after `registeredCallback(null)` → `user === null`.
3. Logged in: `registeredCallback({ uid:"u1", email:"a@b.com", extra:"drop" })` → `user` deep-equals `{ uid:"u1", email:"a@b.com" }`.
4. `onAuthStateChanged` called exactly once after mount.
5. `useUser()` with no wrapper throws `/must be used within a UserProvider/`.
6. `unmount()` → `unsubscribe` called once.

(Optional Navbar test deferred — keep test surface focused on the hook/provider per spec's "without going too heavy.")

## Risks
- **Client-only auth / hydration:** `onAuthStateChanged` runs only in the browser; server render + first paint are deterministically `{ loading:true, user:null }`, matching first client render — no mismatch as long as Navbar renders the same Skeleton for the loading state on both. Avoid consumers that branch on `user` assuming auth is known at SSR.
- **Loading flash:** session restores from IndexedDB after first paint; the `loading` flag + Skeleton in Navbar prevent a logged-out→logged-in flicker.
- **StrictMode (dev):** effects double-invoke; cleanup makes this net-one live listener (you'll see two `onAuthStateChanged` calls in dev). Tests run without StrictMode, so "exactly once" holds.
- **Test isolation:** module-scoped `registeredCallback`/`unsubscribe` must reset in `beforeEach`.

## Verification
1. `npx vitest run tests/lib/mapUser.test.ts tests/components/UserProvider.test.tsx` — all green.
2. `npx vitest run` — full suite still passes (existing Navbar/Avatar/AuthForm tests unaffected).
3. `npm run lint` — clean.
4. `npm run dev`, open `/heists`:
   - Logged out → Navbar shows no Avatar (Skeleton briefly on load).
   - Log in via Firebase (or set a session) → Navbar shows an Avatar with initials from the email; persists across navigation and reflects logout in real time without a manual refresh.
