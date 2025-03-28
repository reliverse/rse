---
description: Standardize core libraries and frameworks when adding or updating dependencies
globs: 
alwaysApply: true
---

# Tech Stack

<author>blefnk/rules</author>
<version>1.0.0</version>

## Context

- Defines official frameworks, libraries, and tools
- Ensures consistent, compatible versions for the project

## Requirements

- Core: Next.js v15 (App Router), React 19, TypeScript v5 (ESM)
- Styling: Shadcn UI, Tailwind v4
- Quality: ESLint, Biome, Knip
- Authentication: better-auth  
- Database: Drizzle ORM
- Package Manager: Bun  
- Storage: Uploadthing
- Forms: TanStack Form
- Icons: lucide-react
- Payments: Polar
- Testing: Vitest

## Examples

<example>
  ✅ bun add next react && bun add -D tailwindcss typescript
</example>

<example type="invalid">
  // Using npm, wrong versions, not using -D for tailwindcss typescript
  ❌ npm install next@14 react@19 tailwindcss@3 typescript@4
</example>

<example>
  import { Globe } from "lucide-react";
</example>

<example type="invalid">
  <svg></svg> <!-- Should use lucide-react instead -->
  Never generate SVG; always import from lucide-react
</example>

## Package Management (Bun)

- Install packages: `bun add [package-name]`  
- Dev dependencies: `bun add -D [package-name]`  
- Run scripts: `bun run [script-name]`  
- One-off commands: `bun x [command]`  
- Shadcn components: `bun ui [component-name]`  
- Update user schema: Edit `src/lib/auth.ts`, then `bun db:auth`

## Authentication (better-auth)

1. Server-Side: Handles sessions with cookies/tokens.
2. Client-Side: Access state via `useSession()`.
3. Route Protection: Use middleware or HOCs to require auth.
