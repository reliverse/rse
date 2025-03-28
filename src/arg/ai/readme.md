# Reliverse CLI: `ai` Command

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

[💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [📚 Docs](https://docs.reliverse.org) • [💖 Sponsors](https://github.com/sponsors/blefnk)

**@reliverse/ai** is a multi-modal AI agent. This integration allows for AI-powered chat and agents. Easily invoke specialized AI agents using simple chat commands and watch them work magic on your code.

## Features

- 💬 **Chat-based AI interactions**  
  Invoke agentic tools in a single chat message using `@agent-name` with automatically detected parameters like paths to files or directories.
  
- 🧩 **Agent-based architecture**  
  Each agent targets a specific problem domain (e.g., AI linting).

- ⚡ **Context-aware processing**  
  Free-form text around agent calls is combined into contextual input for more accurate AI responses.

- 🤖 **@relinter**  
  Offers AI-driven linting checks that go beyond traditional rule-based linters.

- 🏗️ **Seamless CLI integration**  
  Ties directly into [@reliverse/cli](https://npmjs.com/@reliverse/cli) for easy project setup and usage.

- 📝 **Generate Code with AI**  
  Use `reliverse ai code <prompt>` to generate code based on your prompts.

- 🤖 **MCP (Model Context Protocol)**
  "All the useful things in the world, like Slack, GitHub, or even your local filesystem, provide their own unique API to access them. LLM's can call these API's using tools - but these tools require you to write code to connect the LLM to the API. And if the LLM is inside a desktop application, like Cursor or Claude Desktop, you can't manually add new tools yourself. Wouldn't it be nice if you could quickly get access to a set of pre-made tools? And even better, could they work with my existing desktop apps? The Model Context Protocol lets you build toolsets which can be plugged into existing applications." © Matt Pocock

## Chat Usage

Chat commands follow this pattern:

```bash
@agentName <some optional free-form text> @-some-parameter
```

For example:

```bash
@relinter please lint code quality in @-src/components
```

All text before, after, or between these tokens (`@agentName`, `@-params`) is added as context for the agent to use.

## Agents

### 1. Reimgen Agent

**Reimgen** is an AI-powered image generation tool that can help you create images for your project.

```bash
# Simple usage
reliverse ai gen "robot playing guitar"

# Change model
reliverse ai gen "watercolor forest" -m stable-diffusion

# Specify provider for upload
reliverse ai gen "space sunset" -p uploadcare

# Experimental chat invocation
@reimgen gen an image of a cat
```

### 2. Relinter Agent

**Relinter** is an AI-powered alternative to classic linting tools like ESLint—built to spot a wide range of code issues and deliver suggestions in a convenient JSON report.

#### Usage Example

```bash
@relinter please lint code quality in @-src/components
```

#### How It Works

- **AI Processing**: The specified files are analyzed by Reliverse AI (e.g., `GPT-4o-mini`).
- **Output**: Results are stored in `relinter.json`, featuring:
  - File paths
  - Precise issue locations (start/end lines)
  - AI-suggested improvements

#### What It Detects

- Code quality issues: type safety, unused variables, risky equality checks, and more  
- Architectural concerns: circular dependencies, modular structure problems  
- Context-specific improvements, tailored to your codebase

#### ESLint-Like Issues

```typescript
// relinter-test-a.ts
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

Possible lint findings:

- **Type coercion**: mixing `number` and `string`
- **Unused variables**: `unusedVar`
- **Loose equality**: `==` instead of `===`

#### Circular Dependencies Issue

```typescript
// relinter-test-b.ts
import { functionC } from "./relinter-test-c.js";

export function functionB() {
  console.log("Function B called");
  functionC();
}
```

```typescript
// relinter-test-c.ts
import { functionB } from "./relinter-test-b.js";

export function functionC() {
  console.log("Function C called");
  functionB();
}
```

Detected issue:

- **Circular import** between `relinter-test-b.ts` and `relinter-test-c.ts`

## TODO

- [x] ~~Implement basic Reliverse AI Relinter Agent functionality~~
- [ ] Provide a VSCode-like extension to visualize Relinter suggestions inline
- [ ] Customize severity thresholds (`error`, `warning`, `info`) in `relinter.json`
- [ ] Enable quick-fix suggestions for auto-applying changes
- [ ] Integrate with CI pipelines and pre-commit hooks automatically
- [ ] Implement MCP which allows AIs to interact with Reliverse CLI
- [ ] Allow developers connect their MCP to extend Reliverse CLI
- [ ] Connect Reliverse CLI to [Glama](https://glama.ai/mcp/servers) MCP servers
- [ ] `ai code` should follow `.reliverse/rules/*.{md,mdc}`

## Show Your Love

If you find this helpful, please consider [supporting us](https://github.com/sponsors/blefnk) or joining our [Discord](https://discord.gg/Pb8uKbwpsJ) community.
