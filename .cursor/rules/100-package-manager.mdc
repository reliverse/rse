---
description: Use Bun commands when installing or running to maintain consistent package management
globs: 
alwaysApply: true
---

# Bun Package Manager Rules

<author>blefnk/rules</author>
<version>1.0.0</version>

## Context

- For installing dependencies and running scripts in this project
- Eliminates mixing other package managers

## Requirements

- Install dependencies with `bun add [package]` or `bun add -D [package]`.
- Run scripts using `bun [script]` (exception: for build and test scripts use `bun run build` or `bun run test`).
- For standalone scripts use `bun path/to/script.ts` instead of `node`, `ts-node` or `tsx`.
- For one-off commands, use `bun x [command]` instead of `npx`.
- Install Shadcn components via `bun ui [component-name]`.
- Update user schema by editing `src/lib/auth.ts` then `bun db:auth`.

## Examples

<example>
  bun add axios
  bun dev
  bun x vitest
</example>

<example type="invalid">
  npm install axios
  npm run dev
  npx vitest
</example>
