# Spec for use-heists

branch: claude/feature/use-heists
figma_component (if used): n/a

## Summary
- Add a `useHeists` React hook that subscribes to the Firestore `heists` collection in **real time** and returns a typed array of `Heist` objects.
- The hook accepts a single filter argument: `'active'`, `'assigned'`, or `'expired'`. The argument determines which Firestore query is run.
- Use the hook on the `/heists` dashboard page to render only the **titles** of each of the three result sets under their existing section headings.

## Functional Requirements
- Create a hook `useHeists(filter)` (e.g. `hooks/useHeists.ts`) where `filter` is the union type `'active' | 'assigned' | 'expired'`.
- The hook subscribes with Firestore's real-time listener (`onSnapshot`) so the UI updates automatically when heist documents change. The listener must be cleaned up on unmount or when the filter / current user changes.
- The hook reads the current user via the existing `useUser()` context to obtain the current user's `uid`.
- The hook applies the `heistConverter` (from `types/firestore/heist.ts`) so returned items are fully typed `Heist[]` with `deadline` and `createdAt` as `Date`s.
- Query behavior per filter value:
  - **`active`** — heists where `assignedTo == currentUser.uid` AND `deadline` is in the future (deadline has not passed).
  - **`assigned`** — heists where `createdBy == currentUser.uid` AND `deadline` is in the future (deadline has not passed). (Heists the current user assigned BY themselves to others.)
  - **`expired`** — heists where `deadline` is in the past (deadline has passed) AND `finalStatus != null`, regardless of which user created or was assigned the heist.
- The hook returns the array of matching heists. It should also expose enough state for callers to handle loading and error conditions sensibly.
- Update `app/(dashboard)/heists/page.tsx` to call the hook three times (one per filter) and render only the `title` of each heist within the existing `active-heists`, `assigned-heists`, and `expired-heists` sections.

## Figma Design Reference (only if referenced)
- File: n/a
- Component name: n/a
- Key visual constraints: n/a — this feature is data/logic focused; titles render as a simple list under the existing headings.

## Possible Edge Cases
- No current user yet (auth still loading or signed out): hook should not crash and should return an empty result until a `uid` is available.
- A filter returns zero matching heists: the page should show the heading with an empty list (no error).
- Firestore comparing `finalStatus != null`: account for the fact that `!=` queries in Firestore exclude documents where the field is missing entirely; documents are expected to always carry `finalStatus` (set to `null` on creation).
- `deadline` comparisons must use a `Date`/Timestamp boundary captured at query time; consider that "now" is evaluated when the query is built, not continuously.
- Composite queries (equality + range/inequality on a different field) may require a Firestore composite index — note any index that must be created.
- Switching the `filter` argument between renders must tear down the previous snapshot listener to avoid leaks or stale data.

## Acceptance Criteria
- `useHeists('active')` returns only heists assigned to the current user whose deadline is in the future.
- `useHeists('assigned')` returns only heists created by the current user whose deadline is in the future.
- `useHeists('expired')` returns only heists whose deadline has passed and whose `finalStatus` is not null, for any user.
- Results update live when underlying Firestore documents change, without a manual refresh.
- The `/heists` page displays the titles of the three result sets under the correct existing headings.
- No unhandled errors when there is no signed-in user or when a result set is empty.

## Open Questions
- For the `expired` filter, should results be ordered (e.g. most recently passed deadline first)? Default assumption: order by `deadline` descending unless specified.
- Should `active` / `assigned` also exclude heists that already have a non-null `finalStatus`, or strictly use the deadline rule as written? Default assumption: follow the spec exactly (deadline-only for active/assigned).
- Is a shared loading/error UI expected on the page, or is rendering titles only (empty when none) sufficient for this iteration? Default assumption: titles only.

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- The hook builds the correct query (filter field + deadline comparison) for each of `active`, `assigned`, and `expired`, given a mocked current user.
- The hook returns the mapped `Heist[]` from a mocked `onSnapshot` callback and updates when the snapshot emits again.
- The hook returns an empty array (and does not subscribe) when there is no current user.
- The `/heists` page renders the titles returned by each filter under the correct section heading, and renders headings cleanly when a result set is empty.
