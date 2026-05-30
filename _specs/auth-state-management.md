# Spec for auth-state-management

branch: claude/feature/auth-state-management
figma_component (if used): none

## Summary
- Introduce a single, app-wide source of truth for the currently authenticated user.
- A global, real-time listener subscribes to Firebase Authentication state changes and keeps the current user in sync automatically.
- Any page or component can read the current user via a `useUser` hook — returning `null` when logged out and the user object when logged in.
- Scope is the read/listener side only: no sign-up, login, or logout flows.
- Existing places that rely on a user (Navbar / Avatar, currently using a hardcoded name) are updated to read from `useUser`.

## Functional Requirements
- Provide a `useUser` hook, importable via the `@/` path alias, usable from any client component or page.
- `useUser()` returns `null` when no user is authenticated and the user object when authenticated.
- `useUser()` exposes a loading/initializing flag that is `true` until the first auth state result is received.
- A single global listener is registered once for the whole app (not one per consuming component) and is cleaned up properly on unmount.
- The listener subscribes to Firebase Auth state changes using the existing `auth` instance from `lib/firebase.ts`.
- A provider owning the listener wraps the app from the root `app/layout.tsx`, so the hook works in both the public and dashboard route groups.
- The user value exposed by the hook is a trimmed, app-specific user model (not the raw Firebase `User` object).
- Update existing user-dependent UI (Navbar / Avatar) to source the user from `useUser`; the Avatar derives its display from `displayName`, falling back to `email`.
- No sign-up/login/logout logic is added.

## Figma Design Reference (only if referenced)
- File: n/a
- Component name: n/a
- Key visual constraints: n/a — this is an architectural/state change with no new screens.

## Possible Edge Cases
- `useUser` called outside its provider — should throw a clear, predictable error rather than fail silently.
- Initial load before auth resolves — consumers must distinguish "still initializing" from "definitely logged out" to avoid flashing logged-out UI.
- Auth state changing in another tab — the listener should reflect the new status without a manual refresh.
- Logged-out state — user-only UI (e.g. Avatar) renders nothing or a neutral state.
- Authenticated user missing a `displayName` — Avatar falls back to `email`.
- Multiple mounts/unmounts of the provider — listener must not leak or register duplicates.

## Acceptance Criteria
- A `useUser` hook is available and importable via `@/`.
- `useUser()` returns `null` when logged out and the trimmed user object when logged in.
- `useUser()` exposes a loading flag that is `true` until the first auth result arrives.
- Exactly one global auth listener is registered for the app and is unsubscribed on cleanup.
- The provider wraps the app from the root layout, covering both route groups.
- Calling `useUser` outside the provider throws a clear error.
- Navbar/Avatar reflect the authenticated user via `useUser` instead of a hardcoded name.
- During initial loading, user-dependent UI shows a neutral placeholder (e.g. the existing `Skeleton`) rather than a logged-out flash.
- No sign-up/login/logout behavior is introduced.

## Open Questions
- User shape exposed by `useUser`: trimmed app-specific model (resolved: trimmed model).
- Provider location: root `app/layout.tsx` (resolved: root layout).
- Avatar display source: `displayName` falling back to `email` (resolved).
- Behavior outside provider: throw a clear error (resolved).
- Navbar when logged out: hide user-specific items (resolved).

## Testing Guidelines
Create test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- `useUser` returns `null` when the auth listener reports no user (mock the Firebase auth listener).
- `useUser` returns the mapped user object when the auth listener reports a signed-in user.
- `useUser` exposes `loading: true` before the first auth callback fires, and `false` afterward.
- `useUser` throws a clear error when used outside its provider.
- The global listener is subscribed once and its unsubscribe function is called on provider unmount.
- Avatar (or its consumer) renders initials from `displayName`, and falls back to `email` when `displayName` is absent.
