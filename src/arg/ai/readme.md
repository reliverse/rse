# Reliverse AI: Chat & Agents (@reliverse/cli integration)

## Chat

- Users interact with Reliverse AI via chat commands, invoking specific agents using the syntax `@agent-name` with parameters specified via `@-params`.
- Free-form text surrounding the `@agent-name` invocation—either before, after, or between multiple `@-calls` or `@-params`—is aggregated and passed as contextual input to the agent.

## Agents

### Relinter Agent

The Relinter Agent provides AI-powered linting for JavaScript (`.js`, `.jsx`) and TypeScript (`.ts`, `.tsx`) files, offering an intuitive drop-in alternative to traditional linters like ESLint.

#### Usage

- Specify the file or directory path containing the target source files.
- Example invocation via chat: `@relinter please lint code quality in @-src/components`

#### How It Works

- Files are sent to supported Reliverse AI models (currently: `GPT-4o-mini`).
- Generates a structured linting results file, `relinter.json`, which contains:
  - File paths
  - Specific issue locations with start and end line numbers
  - AI-generated improvement suggestions

#### Features

- Detection of code quality issues (type safety, unused variables, incorrect comparisons, etc.)
- Identification of architectural concerns (e.g., circular dependencies)
- AI-driven recommendations tailored specifically to the context of the codebase

#### Example Scenarios

**ESLint-like Issues**:

Example file: `relinter-test-a.ts`

```typescript
function add(a: any, b: any) {
    return a + b;
}

const result = add(5, "10");

console.log("The result is:", result);

let unusedVar = 123;

if (result == 510) {
    console.log("Result equals 510");
}
```

Possible issues detected:

- Type coercion and unsafe operations
- Unused variables
- Loose equality comparisons (`==` instead of `===`)

**Circular Dependencies Detection**:

Example invocation: `@relinter detect circular deps in files @-relinter-test-b.ts and @-relinter-test-c.ts`

File `relinter-test-b.ts`:

```typescript
import { functionC } from "./relinter-test-c.js";

export function functionB() {
  console.log("Function B called");
  functionC();
}
```

File `relinter-test-c.ts`:

```typescript
import { functionB } from "./relinter-test-b.js";

export function functionC() {
  console.log("Function C called");
  functionB();
}
```

Possible issues detected:

- Circular import between `relinter-test-b.ts` and `relinter-test-c.ts`

### TODO

- [x] Implement basic Reliverse AI Relinter Agent functionality and integrate it with Reliverse AI Chat inside of @reliverse/cli.
- [ ] Implement an extension for VSCode-like IDEs to visualize Relinter suggestions directly within the coding environment.
- [ ] Allow configurable thresholds for severity levels (error, warning, info) within `relinter.json` output.
- [ ] Include quick-fix suggestions that can automatically apply recommended changes.
- [ ] Implement CI (continuous integration) hooks or actions to automatically run Relinter as part of build pipelines or pre-commit hooks.
