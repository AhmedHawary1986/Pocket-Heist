# Plan: Auth Forms Feature

## Context

The `/login` and `/signup` pages are currently placeholders with only a heading. This plan implements authentication forms on both pages using a single shared `AuthForm` component. The forms collect email and password, support a show/hide password toggle, and log values to the console on submit. A switch link lets users navigate between the two forms.

---

## Approach

Build a single reusable `AuthForm` client component driven by a `mode: "login" | "signup"` prop. Both pages stay thin — they just render `<AuthForm mode="..." />`. All state (email, password, showPassword) is internal to the component.

---

## Files to Create

### `components/AuthForm/AuthForm.tsx`
- `"use client"` directive — required for `useState`
- Props: `mode: "login" | "signup"`
- Derive `heading`, submit button label, switch link text, and switch `href` from `mode`
- Controlled inputs: `useState` for `email`, `password`, `showPassword`
- Password toggle: `<Eye />` / `<EyeOff />` from `lucide-react` (same usage as `<Clock8>` in Navbar); button must be `type="button"` and have `aria-label` of `"Show password"` / `"Hide password"`
- `handleSubmit`: `event.preventDefault()` then `console.log({ email, password })`
- Switch link uses Next.js `<Link>` component
- Wrap form in `<div className={styles.authForm}>`

### `components/AuthForm/AuthForm.module.css`
- First line: `@reference "../../app/globals.css";`
- `.authForm` — flex column, centered, `max-w-sm`
- `.field` — label + input stacked (flex column)
- `.passwordWrapper` — flex row, input grows, toggle button alongside
- `.toggleBtn` — transparent, no border, cursor pointer
- Submit button uses global `.btn` class; add `w-full` via `.submitBtn` if desired
- `.switchLink` — centered, top margin

### `components/AuthForm/index.ts`
```
export { default } from "./AuthForm"
```

### `tests/components/AuthForm.test.tsx`
Test cases (use `userEvent.setup()` and `vi.spyOn` patterns from existing tests):
1. Renders correct heading for `mode="login"` and `mode="signup"`
2. Renders email input (query via `getByLabelText(/email/i)`)
3. Password input is type `"password"` initially
4. Toggle button switches input type to `"text"`, then back to `"password"`
5. Submit calls `console.log` with `{ email, password }` values
6. Switch link href is `/signup` for login mode, `/login` for signup mode

---

## Files to Modify

### `app/(public)/login/page.tsx`
- Fix exported function name from `SignupPage` → `LoginPage` (existing copy-paste bug)
- Remove the `<h1>` placeholder heading
- Import and render `<AuthForm mode="login" />`
- Keep outer `div.center-content > div.page-content` wrapper

### `app/(public)/signup/page.tsx`
- Remove the `<h2>` placeholder heading
- Import and render `<AuthForm mode="signup" />`
- Keep outer `div.center-content > div.page-content` wrapper

---

## Key Notes

- No new dependencies needed — `lucide-react` already installed
- Toggle button must be `type="button"` to prevent accidental form submission
- Heading is rendered inside `AuthForm`, not in the page, to avoid duplication

---

## Verification

1. `npx vitest run tests/components/AuthForm.test.tsx` — all tests pass
2. `npm run dev` → visit `/login`: heading, email, password + toggle, submit button, "Sign up" link visible
3. Visit `/signup`: heading and switch link change correctly
4. Type values, submit → `console.log` output appears in browser console with `{ email, password }`
5. Eye icon toggles password visibility
6. `npm run build` — no TypeScript errors
