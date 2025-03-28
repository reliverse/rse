---
description: Use when creating or updating a rule or when learning a lesson to retain as a Cursor rule.
globs: .cursor/rules/*.mdc
alwaysApply: false
---

# Cursor Rules Format

## Core Structure

Write rules in this format:

```mdc
---
description: ACTION when TRIGGER to OUTCOME
globs: src/**/*.{ts,tsx}
alwaysApply: false
---

# Rule Title

## Context

- When to apply.
- Prerequisites or conditions.

## Requirements

- Concise, testable, actionable items.

## Examples

<example>
  Valid example with a brief explanation.
</example>

<example type="invalid">
  Invalid example with a short explanation.
</example>
```

## File Organization

### Location

- Store rules in `.cursor/rules/` as `.mdc` files.

### Naming Convention

Use `PREFIX-name.mdc`, where PREFIX is:

- `0XX`: Core standards  
- `1XX`: Tool configs  
- `3XX`: Testing standards  
- `8XX`: Workflows  
- `9XX`: Templates  
- `1XXX`: Language rules  
- `2XXX`: Framework rules  
- `_name.mdc`: Private rules  

### Glob Patterns

Use standard glob patterns:

- Core: `.cursor/rules/*.mdc`
- Language: `src/**/*.{js,ts}`
- Testing: `**/*.test.{js,ts}`
- React Components: `src/ui/components/**/*.tsx`
- Docs: `docs/**/*.md`
- Configs: `*.config.{ts,js,json}`
- Build Artifacts: `dist/**/*`
- Multiple Extensions: `src/**/*.{js,jsx,ts,tsx}`
- Multiple Files: `dist/**/*, docs/**/*.md`

## Required Fields

### Frontmatter

- `description`: ACTION TRIGGER OUTCOME format, under 120 characters.
- `globs`: Standard glob pattern (no quotes).
- `alwaysApply`: Boolean (usually false).

### Body

- `<version>X.Y.Z</version>`
- Context: Define usage conditions.
- Requirements: List actionable, testable items.
- Examples: Show concise valid and invalid rule examples.

## Formatting Guidelines

- Keep rules short and precise.
- Use inline backticks and code blocks; no excess markdown.
- Allowed XML tags: `<version>`, `<danger>`, `<required>`, `<rules>`, `<rule>`, `<critical>`, `<example>`, `<example type="invalid">`.
- Indent XML tag content by 2 spaces.
- Use Mermaid syntax to simplify complex rules.
- Use emojis if they improve clarity.
- Write instructions for LLM processing, not human discussion.

## AI Optimization

- Use imperative language.
- No intro to list points.
- Write precise, deterministic ACTION TRIGGER OUTCOME descriptions.
- Provide minimal valid/invalid examples.
- Optimize for AI context window efficiency: remove redundancy.
- Use standard glob patterns without quotes (`*.js`, `src/**/*.ts`).

## AI Context Efficiency

- Keep frontmatter concise.
- Limit examples to essential patterns.
- Use clear hierarchy.
- Remove redundancy.
- Focus on machine-actionable instructions.

<critical>
  - NEVER include verbose explanations or redundant context.
  - Keep the file as short as possible without sacrificing rule impact.
  - Frontmatter must only include `description`, `globs`, and `alwaysApply`.
</critical>
