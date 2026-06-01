# Spec for Create Heist Form

branch: claude/feature/create-heist-form

## Summary

- Implement the Create Heist form at `app/(dashboard)/heists/create/page.tsx`
- On submission, write a new document to the Firestore `heists` collection using the `CreateHeistInput` interface
- After a successful write, redirect the user to `/heists`
- Users can be fetched from the Firestore `users` collection so that the creator can assign the heist to any registered operative (by codename)

## Functional Requirements

- Fetch all users from the Firestore `users` collection on page load to populate the assignee dropdown
- Display form fields matching the user-supplied fields of `CreateHeistInput`:
  - `title` — text input
  - `description` — textarea
  - `assignedTo` — dropdown populated from the `users` collection (stores the user's `id`)
  - `assignedToCodeName` — auto-filled when an assignee is selected (stores the user's codename)
- The following fields are set programmatically (not shown to the user):
  - `createdBy` — the currently authenticated user's `id`
  - `createdByCodeName` — the currently authenticated user's codename, fetched from the `users` collection
  - `createdAt` — Firestore server timestamp (`serverTimestamp()`)
  - `deadline` — automatically set to 48 hours from the time of submission
  - `finalStatus` — set to `null`
- On form submission, validate that all user-supplied fields are filled before writing to Firestore
- Write the new document to the `heists` Firestore collection using the `heistConverter`
- On successful write, redirect to `/heists`
- Show an inline error message if the Firestore write fails

## Possible Edge Cases

- The `users` collection is empty — show a fallback message in the dropdown (e.g. "No operatives found")
- The current user is not present in the `users` collection — surface a clear error rather than writing a document with missing creator fields
- Firestore write fails due to a network error or security rules rejection — display an error and keep the form filled so the user does not lose their input
- The user navigates away before submitting — no partial document should be written
- The assignee dropdown defaults to an unselected state; submission should be blocked if no assignee is chosen

## Acceptance Criteria

- [ ] The form renders at `/heists/create` with fields: title, description, and assignee dropdown
- [ ] The assignee dropdown lists all users from the `users` collection by codename
- [ ] Selecting an assignee sets both `assignedTo` (id) and `assignedToCodeName` in the submitted payload
- [ ] `createdBy`, `createdByCodeName`, `createdAt`, `deadline`, and `finalStatus` are all set programmatically
- [ ] Submitting a valid form creates a document in the `heists` Firestore collection
- [ ] The user is redirected to `/heists` after a successful submission
- [ ] Submitting with missing required fields shows validation errors and does not write to Firestore
- [ ] A Firestore write error is surfaced inline without clearing the form

## Open Questions

- Should the assignee dropdown allow self-assignment (assigning the heist to yourself)? Yes
- Is there a maximum length for `title` or `description`? No
- Should the deadline (48 hours) be configurable, or is it always fixed? fixed

## Testing Guidelines

Create a test file at `tests/components/CreateHeistForm.test.tsx`. Cover the following cases without going too heavy:

- Renders all expected form fields
- Assignee dropdown is populated with users fetched from Firestore
- Selecting an assignee updates both `assignedTo` and `assignedToCodeName` in state
- Submitting with empty fields shows validation errors and does not call the Firestore write
- A successful submission calls the Firestore `addDoc` with the correct payload shape and redirects to `/heists`
- A Firestore write failure shows an inline error message
