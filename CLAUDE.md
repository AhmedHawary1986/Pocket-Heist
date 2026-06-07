# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pocket Heist is a Next.js 16 app (App Router) built with TypeScript, Tailwind CSS v4, and Vitest. It is a starter project for the Claude Code Masterclass — a small task/mission management app with a heist theme.

## Development Commands

All commands run from the project root (`pocket-heist/`):

```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run ESLint (next core-web-vitals + typescript rules)
npm test       # Run all Vitest tests in watch mode
npx vitest run # Run all tests once (CI mode)
npx vitest run tests/components/Navbar.test.tsx  # Run a single test file
```

## Architecture

### Route Groups

The app uses two Next.js route groups that enforce separate layouts:

**`app/(public)/`** — Unauthenticated pages. Layout wraps children in `<main className="public">` (no Navbar). Pages:
- `/login` — login form
- `/signup` — signup form
- `/preview` — scratch pad for previewing new UI components during development

**`app/(dashboard)/`** — Authenticated pages. Layout injects `<Navbar />` above `<main>`. Pages:
- `/heists` — lists active, assigned, and expired heists
- `/heists/create` — create heist form (skeleton, not yet implemented)
- `/heists/[id]` — heist detail view (skeleton, not yet implemented)

### Component Structure

Every component lives in its own folder under `components/`:

```
components/
  <Name>/
    index.ts          ← re-exports the default export from <Name>.tsx
    <Name>.tsx        ← component implementation
    <Name>.module.css ← scoped styles (optional)
```

Import components via the folder name: `import Navbar from "@/components/Navbar"`. The `index.ts` barrel file is what enables this.

**Existing components:** `AuthForm`, `Avatar`, `Navbar`, `Skeleton` (loading placeholder), `Footer` (not currently injected in any layout).

### Styling System

Two layers of styling work together:

1. **Tailwind CSS v4** — configured via `postcss.config.mjs`. Imported in `app/globals.css` with `@import "tailwindcss"`. Theme tokens are defined using the `@theme {}` block (not `tailwind.config.js`).

2. **CSS Modules** — used for component-scoped styles (e.g., `Navbar.module.css`). Must include `@reference "../../app/globals.css"` at the top to access Tailwind's `@apply` and theme tokens within module files.

**Theme tokens** (defined in `app/globals.css`):
- Colors: `primary` (#C27AFF purple), `secondary` (#FB64B6 pink), `dark` (#030712), `light` (#0A101D), `lighter` (#101828), `success` (#05DF72), `error` (#FF6467), `heading` (white), `body` (#99A1AF)
- Font: `--font-sans` set to Inter (loaded from Google Fonts)

**Shared layout utility classes** (defined in `app/globals.css`, usable anywhere):
- `.page-content` — centered, max-width container (`my-4 mx-auto w-6xl min-w-2xl max-w-full`)
- `.center-content` — vertically centered full-height column (`flex flex-col justify-center min-h-lvh`)
- `.form-title` — centered bold heading for form pages
- `.btn` — primary button (`bg-primary text-dark`, hover switches to `bg-secondary`)

### Path Aliases

`@/*` maps to the project root. Always use `@/` for imports rather than relative paths.

### TypeScript

Strict mode enabled. `vitest/globals` types are included so `describe`, `it`, `expect` etc. are available in tests without importing them.

## Testing

- **Framework:** Vitest with jsdom environment
- **Libraries:** `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- **Setup file:** `vitest.setup.ts` imports `@testing-library/jest-dom/vitest` to extend Vitest matchers with DOM assertions (`toBeInTheDocument`, `toHaveAttribute`, etc.)
- **Test location:** `tests/` directory, mirroring source structure (e.g., `tests/components/Navbar.test.tsx`)
- **Globals:** Vitest globals (`describe`, `it`, `expect`) are available without imports — configured in both `vitest.config.mts` and `tsconfig.json`

## Claude Code Skills

Three slash commands live in `.claude/commands/`:

- `/component` — TDD workflow: write failing test → create component → implement until tests pass → add to `/preview` page
- `/spec` — Parses a feature idea into a markdown spec saved to `_specs/<slug>.md` and creates a matching git branch
- `/commit-message` — Analyzes staged diff and generates a conventional commit message with emoji type prefix

Feature specs land in `_specs/`. Check there for context on in-progress or planned features.

## Next.js Version Note

This project uses **Next.js 16**, which has breaking changes from prior versions. Before writing any Next.js-specific code (middleware, route handlers, metadata API, image optimization, etc.), check `node_modules/next/dist/docs/` for current API conventions. Do not assume patterns from Next.js 13/14/15 are valid.
