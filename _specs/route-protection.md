# Spec for Route Protection

branch: claude/feature/route-protection

## Summary
- Pages in the `(dashboard)` route group should only be accessible to authenticated users.
- Pages in the `(public)` route group should only be accessible to unauthenticated users.
- Auth state is read from the existing `useUser` hook (backed by Firebase Auth).
- While the auth status is being determined, a simple loading indicator is shown in place of the page content to prevent flash of wrong content or premature redirects.

## Functional Requirements
- The `(dashboard)` layout reads auth state via `useUser`. If the user is not authenticated and auth has finished loading, redirect to `/login`.
- The `(public)` layout reads auth state via `useUser`. If the user is authenticated and auth has finished loading, redirect to `/heists`.
- While `useUser` is still resolving (loading state), both layouts display a minimal full-screen loader instead of rendering children.
- Redirects use the Next.js `router.replace()` (or `redirect()` if server-compatible) so the protected page is not added to browser history.
- No route is accessible in the wrong auth state — there is no brief flash of protected content.

## Possible Edge Cases
- Firebase takes a moment to restore session on page load — loader must stay visible until the auth state is definitively known (not just "user is null yet").
- User navigates directly to a dashboard URL while logged out — should land on `/login`.
- Logged-in user navigates directly to `/login` or `/signup` — should be redirected away to `/heists`.
- User logs out from a dashboard page — the logout action already redirects; ensure the dashboard layout's own guard does not cause a double-redirect loop.
- Token expiry mid-session — if `useUser` transitions to unauthenticated, the dashboard layout should trigger the redirect.

## Acceptance Criteria
- Visiting any `/heists*` route while logged out redirects to `/login`.
- Visiting `/login` or `/signup` while logged in redirects to `/heists`.
- During the brief Firebase auth resolution window, a loader is shown and no redirect fires prematurely.
- After a successful login the user lands on the intended dashboard page (no extra redirect round-trips).
- After logout the user lands on `/login` and cannot navigate back to dashboard pages without re-authenticating.

## Open Questions
- Should the loader be a spinner, skeleton, or a plain branded screen? (Currently leaning toward a centered spinner using existing theme tokens.) spinner
- Should unauthenticated access to a specific dashboard URL preserve that URL as a `?redirect=` param so the user is sent there after login? yes

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Dashboard layout redirects to `/login` when `useUser` returns no user and loading is false.
- Dashboard layout renders children when `useUser` returns an authenticated user.
- Dashboard layout renders the loader when `useUser` is in a loading state.
- Public layout redirects to `/heists` when `useUser` returns an authenticated user and loading is false.
- Public layout renders children when `useUser` returns no user and loading is false.
- Public layout renders the loader when `useUser` is in a loading state.
