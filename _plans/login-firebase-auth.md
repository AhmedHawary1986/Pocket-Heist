# Plan: Login Form Firebase Authentication

## Context
The login form at `app/(public)/login/page.tsx` renders `<AuthForm mode="login" />`, but the submit handler only logs to the console — Firebase Auth is never called. This plan wires the login mode to `signInWithEmailAndPassword`, shows a "Logging in…" loading state, and on success replaces the form with a personalised success message ("Welcome, {displayName}"). No redirect on success — the user stays on the login page.

---

## Files to Create

### `lib/auth/login.ts`
Mirrors `lib/auth/signup.ts` in structure. Imports `signInWithEmailAndPassword` from `firebase/auth` and `auth` from `@/lib/firebase`.

`export async function login(email: string, password: string): Promise<string>`:
1. `signInWithEmailAndPassword(auth, email, password)` → `credential`
2. Return `credential.user.displayName ?? "Agent"` (fallback if displayName is somehow null)

Let errors bubble up — `AuthForm` owns error messaging.

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`

**New import:** `login` from `@/lib/auth/login`.

**New state:** `success: boolean` (tracks whether login succeeded and the form should be replaced).

**`humanReadableError` additions** — add login-specific Firebase error codes:
- `auth/invalid-login-credentials` → "Incorrect email or password."
- `auth/wrong-password` → "Incorrect email or password."
- `auth/user-not-found` → "No account found with that email."
- `auth/too-many-requests` → "Too many attempts. Please try again later."

**`handleSubmit` login branch** — replace the `console.log` stub:
```
setLoading(true); setError(null)
try {
  const displayName = await login(email, password)
  setSuccess(true)
  // store displayName for the success message via a separate state string
} catch (err) {
  setError(humanReadableError(err))
} finally {
  setLoading(false)
}
```
Use a `successName` state (`string`) to hold the display name returned by `login()`.

**Submit button:** add `disabled={loading}`, change login label to `loading && mode === "login" ? "Logging in…" : submitLabel` (mirrors the "Signing up…" pattern).

**Success state render:** when `success === true` (login mode only), render a success block *instead of* the form fields and submit button:
```jsx
<p role="status">Welcome, {successName}.</p>
```
Keep the `<p role="alert">` error display for the failure path.

### `tests/components/AuthForm.login.test.tsx` (new file)
Mock `@/lib/auth/login` at module level using `vi.hoisted`:
```ts
const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }))
vi.mock("@/lib/auth/login", () => ({ login: mockLogin }))
```

Test cases:
1. **Renders fields** — login mode renders email + password inputs
2. **Loading state** — mock `login` with a pending promise; submit → button disabled and shows "Logging in…"
3. **Success state** — mock `login` resolves with `"GhostFox"`; submit → form fields gone, `role="status"` shows "Welcome, GhostFox."
4. **Known error** — mock `login` rejects with `{ code: "auth/invalid-login-credentials" }`; submit → `role="alert"` shows "Incorrect email or password."
5. **Unknown error** — mock `login` rejects with `{ code: "auth/unknown-code" }`; submit → `role="alert"` shows "Something went wrong. Please try again."

---

## Sequencing

1. `lib/auth/login.ts` (no deps on other new files)
2. `components/AuthForm/AuthForm.tsx` — add `login` import, `success`/`successName` state, update `humanReadableError`, update `handleSubmit` login branch, update button label, add success render
3. `tests/components/AuthForm.login.test.tsx`

---

## Verification

```bash
npx vitest run tests/components/AuthForm.login.test.tsx
npx vitest run   # all tests — confirm no regressions
npm run build    # confirm no TS errors
```

Manual check: run `npm run dev`, go to `/login`, submit valid credentials → form replaced with "Welcome, {codename}." message. Submit wrong credentials → human-readable error shown below the form.
