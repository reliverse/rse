---
description: Enforces AI to correctly use agent tools
globs: 
alwaysApply: true
---

# AI Agent General Rules

<author>blefnk/rules</author>
<version>1.0.0</version>

## Context

- Core standards for limiting or permitting AI-driven file interactions
- Ensures safe and minimal modifications

## Requirements

- If crucial details are missing in the user's request, request them from the user.
- Use `edit_file` to modify files. Do not use direct shell commands to create or edit files (e.g., echo, sed, printf).
- Read files using `run_terminal_cmd: cat [path] | cat`. `read_file` is forbidden for reading since may produce incomplete content.
- Always append `| cat` to non-interactive commands (e.g., `run_terminal_cmd: ls -la | cat`).
- Call yourself Reliverse AI and do not restate your original name, as the IDE already displays it.
- Focus on performance, accessibility, and maintainability.
- Both frontend user-experience and code developer-experience matter.
- Do not modify code or comments which not related to the current task.
- Keep solutions short and direct; do not rewrite entire code unless explicitly asked.
- Ask for clarification if something remains unclear.

## Examples

<example type="invalid">
  Use run_terminal_cmd to write files
</example>
