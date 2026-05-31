# Plan: Logout Button

## Context

The app has a working Firebase Auth signup flow and global auth state via `useUser()`. The Navbar already conditionally renders the user's Avatar when logged in, but there is no way to sign out. This plan adds a logout button to the Navbar that calls Firebase's `signOut`, is only shown when authenticated, surfaces errors to the user, and requires no redirect.

## Spec Reference

`_specs/logout-button.md` — branch `claude/feature/logout-button`

---

## What to Build

### 1. Auth helper — `lib/auth/logout.ts`

Create a thin wrapper around Firebase `signOut`:

- Import `signOut` from `firebase/auth` and `auth` from `@/lib/firebase`
- Export an async `logout()` function that calls `signOut(auth)`
- Let the caller handle errors (do not swallow them here)

### 2. Logout button in `components/Navbar/Navbar.tsx`

- Add an `onClick` handler that calls `logout()` inside a `try/catch`
- On error: call `window.alert()` with a human-readable message (no toast system exists yet)
- Render a `<button>` (or `<li>` wrapping it) **left of** the "Create New Heist" `<li>` inside the `<ul>`
- Show it only when `!loading && user` — mirror the Avatar's guard condition
- No loading/disabled state required while sign-out is in progress

### 3. Styling

- Use the existing `.btn` global utility class so it visually matches the Create button, or style it as a plain text/ghost button — keep it minimal and consistent with the Navbar's existing list items
- No new CSS module rules required unless visual differentiation is needed

### 4. Tests — `tests/components/Navbar.test.tsx`

Add to the existing test file (do not create a new one). Follow the established pattern: `vi.mock("firebase/auth", ...)`, `vi.mock("@/lib/firebase", ...)`, `renderWithProvider(<Navbar />)`.

Cover the four cases from the spec:

1. **Logout button visible when logged in** — trigger `onAuthStateChanged` callback with a mock user, assert button is in the document
2. **Logout button hidden when logged out** — callback fires with `null`, assert button is not in the document
3. **Calls `signOut` on click** — mock `signOut` as a `vi.fn()`, simulate click, assert it was called once
4. **Does not throw when `signOut` rejects** — mock `signOut` to return `Promise.reject(new Error(...))`, click, assert no unhandled error and `window.alert` was called

---

## Files to Modify / Create

| Action | Path |
|--------|------|
| Create | `lib/auth/logout.ts` |
| Modify | `components/Navbar/Navbar.tsx` |
| Modify | `tests/components/Navbar.test.tsx` |

---

## Key Utilities to Reuse

- `useUser()` from `@/components/UserProvider` — already imported in Navbar, provides `{ user, loading }`
- `auth` from `@/lib/firebase` — pass to `signOut`
- Existing `vi.mock` setup in `tests/components/Navbar.test.tsx` — extend, don't replace

---

## Verification

1. Run `npx vitest run tests/components/Navbar.test.tsx` — all tests green
2. Run `npm run dev` and sign in — logout button appears left of Create button
3. Click logout — user is signed out, button disappears, no redirect
4. Simulate a network failure (temporarily throw in `logout.ts`) — alert appears, no crash
