# Plan: Create Heist Form

**Spec:** `_specs/create-heist-form.md`  
**Branch:** `claude/feature/create-heist-form`

## Context

The `/heists/create` page is currently a skeleton. This plan implements the full form that lets an authenticated user create a new heist document in Firestore, assign it to any registered operative, and get redirected to `/heists` on success. The `CreateHeistInput` type already exists; we need to wire up the UI, Firestore reads/writes, and auth-context integration.

---

## Step 1 — Add `FirestoreUser` type

Create `types/firestore/user.ts`:

```
FirestoreUser { id: string, codename: string }
```

Mirrors the shape written to Firestore during signup (`lib/auth/signup.ts` → `setDoc(doc(db, 'users', uid), { id, codename })`).

---

## Step 2 — Create `CreateHeistForm` component

Follow the existing component folder convention:

```
components/
  CreateHeistForm/
    index.ts
    CreateHeistForm.tsx
    CreateHeistForm.module.css   (optional, add only if scoped styles needed)
```

### State

| state var | type | purpose |
|---|---|---|
| `title` | `string` | controlled text input |
| `description` | `string` | controlled textarea |
| `assignedTo` | `string` | selected user id |
| `assignedToCodeName` | `string` | auto-filled on assignee select |
| `users` | `FirestoreUser[]` | operative list for dropdown |
| `loadingUsers` | `boolean` | while fetching users |
| `error` | `string \| null` | inline error |
| `submitting` | `boolean` | while writing to Firestore |

### On mount — fetch operatives

```ts
getDocs(collection(db, 'users'))
```

- Map results into `FirestoreUser[]`, set `users` state.
- Find the current user's entry using `user.uid` from `useUser()` to get `createdByCodeName`.
- If the current user is not found in the collection, set `error` and block submission.

### Assignee dropdown

- `<select>` populated from `users[]` — display `codename`, value = `id`.
- On change: set `assignedTo` (id) and `assignedToCodeName` (codename) together.
- Default option: `<option value="">— Select an operative —</option>` (disabled).
- Edge case: if `users` is empty after fetch, show `<option disabled>No operatives found</option>`.

### Validation (client-side, before Firestore write)

Block submission and show field-level or summary error if:
- `title` is empty
- `description` is empty
- `assignedTo` is empty (no assignee selected)

### Submit handler

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  // 1. Validate
  // 2. Build CreateHeistInput payload:
  const payload: CreateHeistInput = {
    title,
    description,
    createdBy: user.uid,
    createdByCodeName,           // from users fetch
    assignedTo,
    assignedToCodeName,
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    finalStatus: null,
    createdAt: serverTimestamp(),
  }
  // 3. addDoc(collection(db, 'heists'), payload)
  // 4. router.push('/heists')
}
```

**Note on converter:** Do NOT use `heistConverter.withConverter()` for the write — its `toFirestore` signature expects `Partial<Heist>` (which uses `Date` for `createdAt`), but `CreateHeistInput` uses `FieldValue`. Write directly to `collection(db, 'heists')` to avoid the type conflict.

### Error display

Reuse the `{error && <p role="alert">{error}</p>}` pattern from `AuthForm.tsx`. Keep form values intact on error so the user doesn't lose input.

### Button state

- Disabled while `submitting` or `loadingUsers`.
- Label: "Submit Mission" → "Submitting…" while in flight.

---

## Step 3 — Wire up the page

Update `app/(dashboard)/heists/create/page.tsx`:

```tsx
import CreateHeistForm from "@/components/CreateHeistForm"

export default function CreateHeistPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <CreateHeistForm />
      </div>
    </div>
  )
}
```

---

## Step 4 — Tests

File: `tests/components/CreateHeistForm.test.tsx`

Mock strategy (follow `AuthForm.test.tsx` pattern using `vi.hoisted`):

- `vi.mock('firebase/firestore')` → mock `getDocs`, `addDoc`, `collection`, `serverTimestamp`
- `vi.mock('@/lib/firebase')` → mock `db`
- `vi.mock('next/navigation')` → mock `useRouter` / `mockPush`
- `vi.mock('@/components/UserProvider', ...)` → mock `useUser` returning a fake uid

Test cases:
1. Renders title input, description textarea, and assignee dropdown
2. Dropdown is populated with users returned from `getDocs`
3. Selecting an assignee updates both `assignedTo` and `assignedToCodeName`
4. Submitting with empty fields shows a validation error and does NOT call `addDoc`
5. Valid submission calls `addDoc` with the correct payload shape and calls `router.push('/heists')`
6. Firestore `addDoc` rejection surfaces an inline error and does not navigate

---

## Verification

1. `npm run dev` → navigate to `/heists/create`
2. Confirm dropdown lists all users from Firestore
3. Fill form → submit → verify redirect to `/heists`
4. Submit empty form → verify validation errors appear
5. `npx vitest run tests/components/CreateHeistForm.test.tsx` — all tests pass
6. `npm run lint` — no TypeScript or lint errors
