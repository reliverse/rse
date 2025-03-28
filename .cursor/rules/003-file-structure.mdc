---
description: Enforce consistent folder structure for clarity
globs: 
alwaysApply: true
---

# File Structure Standards

<author>blefnk/rules</author>
<version>1.0.0</version>

## Context

- Applies when adding files or directories.
- Ensures consistency in Next.js TypeScript projects.

## Requirements

- Store core pages in `src/app/` or `src/app/[locale]/` (i18n). API routes go in `src/app/api/`.
- Place shared components in `src/ui/`, separating primitives from custom components.
- Keep DB schemas in `src/db/schema/` and utilities in `src/lib/`.
- Store tests in `tests/` or near related files for integration tests.

## Examples

<example>
    Minimal structure:
    ```bash
    src/
    ├── app/                # App Router (route-based pages)
    ├── assets/             # Static assets (images, icons)
    ├── ui/
    │   ├── primitives/     # Shadcn UI installed via `bun ui [component-name]`
    │   ├── components/     # App-specific components
    │       └── layouts/
    ├── db/
    ├── lib/                # server actions, hooks, utils
    └── tests/              # (test critical logic/components only)
    ```
    Only the core files are shown above. Use the file-browse tool as needed.
</example>

## Import Conventions

- Use the `~/` alias for `src` (e.g., `import { Button } from "~/ui/primitives/button"`).
- App-specific components: `~/ui/components`.
- Shadcn primitives: `~/ui/primitives`.

## File Naming & Organization

| Type                | Convention                  | Example                  |
|---------------------|-----------------------------|--------------------------|
| React components    | `kebab-case`                | `dropdown-menu.tsx`      |
| Utility functions   | `camelCase`                 | `formatDate.ts`          |
| Custom React hooks  | `camelCase` + `use` prefix  | `useAuth.ts`             |
| Client Components   | `"use client"` at top       | `"use client";`          |
| Server Components   | Default async/await         | *(No directive needed)*  |
