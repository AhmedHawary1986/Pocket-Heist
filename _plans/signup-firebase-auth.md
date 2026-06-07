# Plan: Signup Firebase Auth with Codename Generation

## Context
The signup form in `app/(public)/signup/page.tsx` renders `<AuthForm mode="signup" />` but the submit handler only logs to the console. This plan wires it to Firebase Auth, generates a random heist-themed codename as the user's display name, and creates a Firestore `users` document with only `id` and `codename` — no email stored.

---

## Files to Create

### `lib/auth/generateCodename.ts`
Pure function, no imports. Three heist-themed word arrays:
- `descriptors`: e.g. `["Silent", "Shadow", "Phantom", "Crimson", "Iron", "Ghost", "Slick", "Rogue"]`
- `nouns`: e.g. `["Fox", "Vault", "Wire", "Blade", "Cipher", "Crown", "Dagger", "Mask"]`
- `roles`: e.g. `["Ace", "Fixer", "Runner", "Broker", "Hawk", "Shade", "Ghost", "Mark"]`

`generateCodename()` picks one from each via `Math.random()` and concatenates — every word is already capitalized, so the result is naturally PascalCase (e.g. `"SilentVaultAce"`).

### `lib/auth/signup.ts`
Imports: `createUserWithEmailAndPassword`, `updateProfile` from `firebase/auth`; `doc`, `setDoc` from `firebase/firestore`; `auth`, `db` from `@/lib/firebase`; `generateCodename` from `@/lib/auth/generateCodename`.

`export async function signup(email: string, password: string): Promise<void>`:
1. `createUserWithEmailAndPassword(auth, email, password)` → `credential`
2. `generateCodename()` → `codename`
3. `updateProfile(credential.user, { displayName: codename })`
4. `setDoc(doc(db, "users", credential.user.uid), { id: credential.user.uid, codename })` — no email field

Let errors bubble up (no try/catch). AuthForm owns error messaging.

### `tests/lib/generateCodename.test.ts`
Three cases (no mocks needed):
- Returns a non-empty string
- Starts with uppercase and contains no spaces (PascalCase check)
- Produces varied results: call 20 times, assert `Set.size > 1`

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`
New imports: `useRouter` from `next/navigation`; `signup` from `@/lib/auth/signup`.

New state: `error: string | null`, `loading: boolean`.

Add `const router = useRouter()` at the top of the component body.

Replace `handleSubmit` — make async, add signup branch:
```
if (mode === "signup") {
  setLoading(true); setError(null)
  try { await signup(email, password); router.push("/heists") }
  catch (err) { setError(humanReadableError(err)) }
  finally { setLoading(false) }
} else {
  console.log({ email, password })   // login: untouched
}
```

Add inline `humanReadableError(err)` helper mapping Firebase codes:
- `auth/email-already-in-use` → "An account with this email already exists."
- `auth/weak-password` → "Password must be at least 6 characters."
- `auth/invalid-email` → "Please enter a valid email address."
- fallback → "Something went wrong. Please try again."

Submit button: add `disabled={loading}`, change label to `loading && mode === "signup" ? "Signing up…" : submitLabel`.

Error display (above or below submit button):
`{error && <p role="alert" className={styles.errorMsg}>{error}</p>}`

### `components/AuthForm/AuthForm.module.css`
Add `.errorMsg` — use `@apply text-error text-sm` (matches the existing `text-error` theme token).

### `tests/components/AuthForm.test.tsx`
At module level, add `vi.hoisted` mocks for `@/lib/auth/signup` and `next/navigation` (same pattern as `UserProvider.test.tsx`):
```
const { mockSignup } = vi.hoisted(() => ({ mockSignup: vi.fn() }))
vi.mock("@/lib/auth/signup", () => ({ signup: mockSignup }))
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }))
```
Add `beforeEach(() => vi.clearAllMocks())`.

Two new test cases:
1. **Error on failure** — mock `signup` to reject with `{ code: "auth/email-already-in-use" }`, fill form, submit, assert `findByRole("alert")` contains "already exists"
2. **Loading state** — mock `signup` to return a pending promise, submit, assert button is disabled and shows "Signing up…", resolve, assert button returns to normal (use `waitFor`)

---

## Sequencing

1. `generateCodename.ts` (no deps)
2. `signup.ts` (needs generateCodename)
3. `AuthForm.tsx` + `AuthForm.module.css` (needs signup.ts)
4. `tests/lib/generateCodename.test.ts`
5. `tests/components/AuthForm.test.tsx` (needs updated AuthForm + signup mock)

---

## Verification

```bash
npx vitest run tests/lib/generateCodename.test.ts
npx vitest run tests/components/AuthForm.test.tsx
npx vitest run   # all tests — confirm no regressions
npm run build    # confirm no TS errors
```

Manual check: run `npm run dev`, go to `/signup`, submit valid credentials, confirm redirect to `/heists` and user appears in Firebase Console (Auth + Firestore `users` collection with correct fields, no email).
