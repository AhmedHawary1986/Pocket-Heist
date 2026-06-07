# Auth Forms

## Overview

Implement authentication forms for the `/login` and `/signup` pages. Each form collects an email and password, includes a toggle to show/hide the password, and a submit button. On submission, form data is logged to the console. Users can easily navigate between the two forms via a link.

## Goals

- Provide a login form at `/login` with email, password, and a submit button
- Provide a signup form at `/signup` with email, password, and a submit button
- Both forms include a show/hide password toggle icon
- On submit, log form values to the browser console (no API calls yet)
- Each form includes a link to switch to the other form (e.g. "Don't have an account? Sign up")

## Non-Goals

- No real authentication or API integration
- No form validation beyond browser defaults
- No error messages or loading states

## User Stories

- As a visitor, I can fill in my email and password on the login page and click "Login" to see my credentials logged in the console
- As a visitor, I can fill in my email and password on the signup page and click "Sign Up" to see my credentials logged in the console
- As a visitor, I can toggle the password field between hidden and visible using an icon button
- As a visitor on the login page, I can click a link to go to the signup page, and vice versa

## Acceptance Criteria

- `/login` renders a form with an email input, a password input, a show/hide password toggle, and a "Login" submit button
- `/signup` renders a form with an email input, a password input, a show/hide password toggle, and a "Sign Up" submit button
- Clicking the show/hide icon changes the password input type between `password` and `text`
- Submitting either form calls `console.log` with the email and password values
- Each page includes a link to the other auth page
- Forms use the existing public layout (no Navbar)

## UI / UX Notes

- Forms should be centered on the page using the `.center-content` utility class
- Use the `.form-title` utility class for the heading
- The show/hide password icon sits inside or adjacent to the password input field
- Styling should match the existing theme (dark background, primary/secondary accent colors)
- The switch-form link sits below the submit button

## Open Questions

- Should the show/hide icon use an SVG icon or a text label (e.g. "Show" / "Hide")? SVG icon
- Should there be a "Forgot password?" link on the login form in a future iteration? yes
