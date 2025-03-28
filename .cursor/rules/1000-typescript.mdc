---
description: Enforce strict typing when coding to ensure reliable TypeScript usage
globs: *.ts
alwaysApply: false
---

# TypeScript Rules

<author>blefnk/rules</author>
<version>1.0.0</version>

## Context

- Applies both to TypeScript and JavaScript
- Encourages strict, clear typing, and modern JS

## Requirements

- Prefer ESM over CommonJS.
- Avoid `any`; use `unknown`, generics, or precise types.
- Remove and unused variables and expressions.
- Use `as const` for exact object types.
- Prefer `??` over `||` for nullish coalescing.
- Handle promises with `await` or `.then()`.
- Throw `Error` instances, not strings or objects.
- Avoid non-null assertions (`!`) and redundant `?.!`.
- Never use `eval()` or dynamic code execution.
- Use `import` instead of `require()`.
- Add comments for `@ts-<directive>` usage.
- Favor functional programming; limit OOP to custom errors.
- Ensure both operands of `+` are the same type.
- Use namespaces only for declaration merging; avoid `module`.
- Mark immutable component props as `readonly`.
- Use optional chaining (`?.`) to prevent runtime errors.
- Avoid redundant type annotations (e.g., `function Example() { return true; }`).
- Prefer `[]` over generic array constructors.
- Prevent duplicate values in enums and union types.

## Examples

<example>
  function parseData(data: unknown): string | null {
    if (typeof data === "string") return data;
    return null;
  }
</example>

<example type="invalid">
  function parseData(data: any): any {
    return data;
  }
</example>
