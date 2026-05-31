# Spec for Logout Button

branch: claude/feature/logout-button  
figma_component (if used): N/A

## Summary
- Add a logout button to the app that signs the current user out of Firebase Auth when clicked.
- The button is only visible when a user is logged in.
- No redirects after logout are required at this stage.

## Functional Requirements
- A logout button is rendered somewhere in the UI visible to authenticated users (e.g. the Navbar).
- Clicking the button calls Firebase Auth's `signOut` method.
- The button is hidden (not rendered) when no user is logged in.
- No page redirect or navigation occurs after signing out.

## Figma Design Reference (only if referenced)
- N/A

## Possible Edge Cases
- The `signOut` call fails (e.g. network error) — the button should not silently fail; at minimum, the error should be logged.
- The user state updates asynchronously after sign-out — the button should disappear once the auth state reflects a logged-out user.
- The button is clicked multiple times in quick succession — should not trigger multiple concurrent sign-out calls.

## Acceptance Criteria
- The logout button is visible in the UI when a user is authenticated.
- The logout button is not visible when no user is authenticated.
- Clicking the button signs the user out via Firebase Auth.
- After sign-out, the button disappears (since the user is no longer authenticated).
- No redirect occurs after logout.

## Open Questions
- Where exactly should the logout button live — inside the Navbar, or as a standalone component? it should be left of the create button
- Should there be any visual feedback (loading state, disabled state) while the sign-out is in progress? No
- Should sign-out errors be shown to the user, or only logged to the console? Yes

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renders the logout button when a user is logged in.
- Does not render the logout button when no user is logged in.
- Calls Firebase Auth `signOut` when the button is clicked.
- Does not throw or crash if `signOut` rejects.
