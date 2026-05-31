# Spec for login-form-firebase-auth

branch: claude/feature/login-form-firebase-auth

## Summary
- Wire the existing login form (AuthForm in mode="login") to Firebase Auth using `signInWithEmailAndPassword`
- Show a success message in-place after a successful login (no redirect)
- Handle and display login-specific Firebase errors in a user-friendly way
- Mirror the loading state pattern already used in signup mode

## Functional Requirements
- On form submit, call `signInWithEmailAndPassword` from Firebase Auth with the provided email and password
- While the request is in-flight, disable the submit button and show a "Logging in…" label (matching the "Signing up…" pattern in signup mode)
- On success, clear the form and display a success message (e.g. "You're in. Welcome back.") in place of or below the form
- On failure, map the Firebase error code to a human-readable message and display it via the existing error state (`<p role="alert">`)
- No redirect on success — the success message is shown in-place

## Possible Edge Cases
- Wrong password or email — Firebase returns `auth/invalid-login-credentials` (or `auth/wrong-password` / `auth/user-not-found` in older SDK versions); must map to a friendly message
- Empty fields submitted before validation
- Network error or Firebase unavailable — generic fallback error message
- User submitting the form multiple times rapidly — button should be disabled while loading

## Acceptance Criteria
- Submitting correct credentials shows a success message without navigating away
- Submitting incorrect credentials shows a human-readable error below the form
- The submit button is disabled and labelled "Logging in…" while the request is pending
- Login-specific Firebase error codes are mapped to friendly messages in `humanReadableError()`
- A `lib/auth/login.ts` utility wraps `signInWithEmailAndPassword`, matching the pattern of `lib/auth/signup.ts`

## Open Questions
- What exact text should the success message show? (default: "You're in. Welcome back.") Welcome + DisplayName of the user 
- Should the success state replace the form entirely, or appear below it? yes

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renders email and password fields in login mode
- Shows "Logging in…" on the submit button while the request is pending
- Displays a success message when Firebase resolves successfully
- Displays a human-readable error when Firebase rejects with a known error code
- Displays a generic error for unknown Firebase error codes
- Submit button is disabled while loading
