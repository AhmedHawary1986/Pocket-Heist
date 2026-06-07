# Plan: useHeists Data Hook

**Spec:** `_specs/use-heists.md`
**Branch:** `claude/feature/use-heists`

## Context

The `/heists` dashboard page (`app/(dashboard)/heists/page.tsx`) is a static skeleton with three empty sections: active, assigned, and expired heists. There is no way yet to read heist documents from Firestore. This plan adds a real-time `useHeists` hook that subscribes to the `heists` collection and returns a typed `Heist[]` filtered by one of three modes, then wires it into the page to render the titles of each result set.

Per the clarifications:
- **active / assigned** use the deadline rule only (no `finalStatus` filter).
- **expired** uses `finalStatus != null` (literal, two-inequality query).

All the building blocks already exist: the `Heist` type and `heistConverter` (`types/firestore/heist.ts`), the Firestore `db` (`lib/firebase.ts`), and the `useUser()` auth context (`components/UserProvider/UserProvider.tsx`). Test mocking conventions are established in `tests/components/CreateHeistForm.test.tsx` (`vi.hoisted` + `vi.mock`).

---

## Step 1 — Create the `useHeists` hook

New file: `hooks/useHeists.ts` (new `hooks/` folder; `@/hooks/...` already resolves via the `@/*` alias).

### Signature & return

```ts
export type HeistFilter = 'active' | 'assigned' | 'expired'

export function useHeists(filter: HeistFilter): {
  heists: Heist[]
  loading: boolean
  error: Error | null
}
```

### Behavior

- Read `const { user } = useUser()` to obtain `user.uid`.
- In a `useEffect` keyed on `[filter, user?.uid]`:
  - If there is no `user`, set `heists` to `[]`, `loading` to `false`, and do **not** subscribe.
  - Otherwise build the filtered query (below), call `onSnapshot(q, onNext, onError)`, and store results via the `heistConverter`.
  - Return the `onSnapshot` unsubscribe function from the effect for cleanup (tears down on unmount and when `filter`/`uid` change).
- Capture `now = new Date()` when building the query (evaluated at subscribe time, per spec edge case).
- Apply the converter so `deadline`/`createdAt` come back as `Date`s: build the collection ref with `collection(db, 'heists').withConverter(heistConverter)`, then `query(ref, ...constraints)`. `onSnapshot` `snapshot.docs.map(d => d.data())` then yields `Heist[]`.
  - Note: the converter's `toFirestore` is only exercised on writes; reads use `fromFirestore`, so `withConverter` is safe here (unlike the create-form write path).

### Queries per filter

Using `where`, `query`, `orderBy` from `firebase/firestore`:

| filter | constraints |
|---|---|
| `active` | `where('assignedTo','==',uid)`, `where('deadline','>', now)` |
| `assigned` | `where('createdBy','==',uid)`, `where('deadline','>', now)` |
| `expired` | `where('finalStatus','!=', null)`, `where('deadline','<', now)` |

- For `expired`, the SDK requires the first `orderBy` to be on the inequality field used by `!=`; add `orderBy('finalStatus')` then `orderBy('deadline','desc')`. For `active`/`assigned`, `deadline` is the range field, so `orderBy('deadline','asc')` is implied/required.
- `null` is a valid sentinel here because every heist is created with `finalStatus: null` (see `CreateHeistInput`), so `!= null` correctly returns only completed (`success`/`failure`) heists.

### Firestore composite indexes

These compound queries require composite indexes. First run in dev will surface a console error with a click-to-create link; capture the definitions in `firestore.indexes.json` if present, otherwise create via the console link. Expected indexes:
- `heists`: `assignedTo` ASC + `deadline` ASC
- `heists`: `createdBy` ASC + `deadline` ASC
- `heists`: `finalStatus` ASC + `deadline` DESC

---

## Step 2 — Wire the hook into the page

Update `app/(dashboard)/heists/page.tsx`:

- Add `"use client"` at the top (the hook depends on `useUser` context and `onSnapshot`).
- Call the hook three times:
  ```ts
  const { heists: active } = useHeists('active')
  const { heists: assigned } = useHeists('assigned')
  const { heists: expired } = useHeists('expired')
  ```
- Under each existing heading, render `<ul>` of `heist.title` (keyed by `heist.id`). Keep the existing `active-heists` / `assigned-heists` / `expired-heists` wrapper divs and `<h2>` headings.
- Empty result set renders the heading with an empty list (no error) — no special-casing required for this iteration.

---

## Step 3 — Tests

New file: `tests/hooks/useHeists.test.tsx`. Follow the `vi.hoisted` + `vi.mock` pattern from `CreateHeistForm.test.tsx`.

Mocks:
- `vi.mock('firebase/firestore')` → mock `collection`, `query`, `where`, `orderBy`, `onSnapshot`. Have `where`/`orderBy`/`query` return descriptor objects so calls can be asserted; have `onSnapshot` capture the `onNext` callback and return an `unsubscribe` spy.
- `vi.mock('@/lib/firebase')` → `db: {}`.
- `vi.mock('@/components/UserProvider')` → controllable `useUser` returning a fake `uid`.
- A `withConverter` stub on the collection ref (return the ref) so the converter path doesn't break under mocks.

Render the hook with `@testing-library/react`'s `renderHook`.

Cases:
1. `active` builds `where('assignedTo','==',uid)` + a `deadline` `>` constraint.
2. `assigned` builds `where('createdBy','==',uid)` + a `deadline` `>` constraint.
3. `expired` builds `where('finalStatus','!=', null)` + `deadline` `<` constraint.
4. Returns mapped `Heist[]` when the captured `onSnapshot` callback emits, and re-renders with new data on a second emit.
5. No current user → returns `[]` and `onSnapshot` is never called.
6. Unmount calls the `unsubscribe` function returned by `onSnapshot`.

(Optional) A light page test under `tests/` asserting titles render under the right heading, mocking `useHeists` to return fixed arrays.

---

## Verification

1. `npm run dev` → sign in, navigate to `/heists`.
2. Confirm titles appear under the correct headings. If a console error links to create a Firestore index, follow it (Step 1 indexes), then confirm results populate.
3. Create a heist via `/heists/create` assigned to yourself → it appears live under "Your Active Heists" without refresh (real-time check).
4. `npx vitest run tests/hooks/useHeists.test.tsx` — all tests pass.
5. `npm run lint` — no TypeScript/lint errors.
