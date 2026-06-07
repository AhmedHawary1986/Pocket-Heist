# Spec for heists-dashboard-design

branch: claude/feature/heists-dashboard-design  
figma_component (if used): N/A  

## Summary
- Redesign the `/heists` dashboard page to display heists in two visually distinct sections: **Assigned Heists** (active/upcoming, card grid) and **Heist History** (completed, list rows).
- Heist cards show the title, target user, creator, scheduled datetime, and a countdown timer.
- History rows show the heist title, target, creator, datetime, and a status badge (e.g. SUCCESS).

## Functional Requirements
- The page renders two sections in order: "Assigned Heists" then "Heist History".
- **Assigned Heists section:**
  - Section heading with a target/crosshair icon and the text "Assigned Heists".
  - Renders heists where the current user is the creator (`By`) or target (`To`) and the heist has not yet expired/completed.
  - Cards are displayed in a 2-column responsive grid (single column on mobile).
  - Each card shows:
    - Heist title (bold, prominent)
    - A clock icon in the top-right corner
    - "To: @username" with a person icon (the target)
    - "By: @username" with a person icon (the creator)
    - Scheduled datetime formatted as "MMM D, h:mm A"
    - Countdown label showing time remaining (e.g. "4h 42m", "1d 0h", "2d 0h") highlighted in a distinct accent color (orange/purple per urgency or as a theme accent)
- **Heist History section:**
  - Section heading with an archive/box icon and the text "Heist History".
  - Renders heists that are expired or marked complete/successful.
  - Each row (full width) shows:
    - A green success checkmark icon on the left
    - Heist title
    - Scheduled datetime on the right (formatted as "MMM D, h:mm A")
    - A "SUCCESS" badge (green, pill/rounded) on the far right
    - Below the title: "To: @username" and "By: @username" in a horizontal row with person icons
- Username mentions are rendered in the `primary` color (purple `#C27AFF`) to match the theme.
- Countdown text color varies to indicate urgency: use `secondary` (pink) for near-deadline and `primary` (purple) for further deadlines.

## Figma Design Reference (only if referenced)
- File: Screenshot provided by user (D:\Learn\AgenticAI\Images\Screenshot 2026-06-03 042950.png)
- Component name: Heists Dashboard
- Key visual constraints:
  - Dark background matching the app's `dark`/`light` theme tokens
  - Cards use a slightly lighter card surface (`lighter` token, `#101828`) with rounded corners
  - Section headings use a small icon inline with the label text
  - Countdown timer text is distinctly colored (not plain body text)
  - SUCCESS badge is a solid green pill with uppercase label text
  - Person icon and calendar icon prefix the To/By and datetime fields respectively

## Possible Edge Cases
- No assigned heists: show an empty-state message within the Assigned Heists section (e.g. "No active heists assigned to you.").
- No history: show an empty-state message within the Heist History section.
- Long heist titles should wrap gracefully within the card without overflowing.
- Countdown hits zero or goes negative: show "Expired" or "0h 0m" rather than a negative value.
- Heist has no target user or no creator: gracefully omit that row rather than rendering "@undefined".

## Acceptance Criteria
- `/heists` page renders two sections: Assigned Heists and Heist History.
- Assigned heists are displayed in a 2-column grid of cards matching the screenshot layout.
- Each card displays: title, clock icon, To/By usernames in primary color, datetime, and countdown.
- History rows display: success icon, title, To/By usernames, datetime, and SUCCESS badge.
- Empty states render when either section has no data.
- Page is responsive: 2-column grid collapses to 1 column on small screens.
- All theme tokens (colors, fonts) are used — no hard-coded hex values in component files.

## Open Questions
- Should the countdown be computed client-side in real time (live ticking) or rendered as a static snapshot on page load? (live ticking)
- What determines "assigned" vs "history" — is it a `status` field on the heist document, or purely based on whether the `scheduledAt` date is in the past? status field
- Are usernames pulled from the Firestore user profile, or are they stored directly on the heist document? from heist document

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renders the "Assigned Heists" section heading and cards when assigned heist data is provided.
- Renders the "Heist History" section heading and rows when historical heist data is provided.
- Displays the correct To/By usernames and datetime for each heist card and history row.
- Shows an empty-state message when there are no assigned heists.
- Shows an empty-state message when there is no heist history.
- Countdown label renders with a value for a future heist.
- SUCCESS badge is visible on each history row.
