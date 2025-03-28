# Reliverse CLI: `clone` Command

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

[📦 NPM](https://npmjs.com/@reliverse/cli) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [📚 Docs](https://docs.reliverse.org/cli)

**The `clone` command** in **@reliverse/cli** lets you directly clone GitHub repositories or crawl arbitrary URLs to capture “LLM-ready” structure for AI-driven analysis.

## Features

- 🚀 **One Command, Two Modes**  
  - **GitHub Repos**: Quickly clone repositories from GitHub.
  - **Other URLs**: Use **Firecrawl** under the hood to capture website content in a structured format.

- 🔗 **Seamless Integration**  
  Works natively with [@reliverse/cli](https://npmjs.com/@reliverse/cli) to unify your development workflow.

- ⚡ **LLM-Ready Output**  
  Non-GitHub links get processed via Firecrawl, resulting in “Markdown/HTML” style outputs ideal for AI consumption.

- 💡 **Context-Aware**  
  The crawler automatically detects relevant files, code snippets, or documentation sections to help you feed them into AI agents efficiently.

## Getting Started

1. **How to Use**:  

   ```sh
   reliverse clone <url>
   ```

## Usage

### Cloning a GitHub Repository

When you provide a GitHub URL (e.g., `https://github.com/user/repo` or `git@github.com:user/repo.git`), **Reliverse CLI** automatically detects and performs a standard clone:

```sh
reliverse clone https://github.com/reliverse/relidler-js-bundler
```

- **Result**: A local copy of the GitHub repo is placed in a folder matching the repository name.

### Crawling Other URLs with Firecrawl

Supplying a non-GitHub URL, such as a personal website, documentation page, or any public resource, triggers a deep crawl via **Firecrawl**:

```sh
reliverse clone https://example.com
```

- **Result**: Generates an LLM-friendly “github-like” file structure to capture text and code snippets. Perfect for feeding into Reliverse AI or other language models.

## How It Works

1. **URL Check**  
   The CLI first checks if the URL is a valid GitHub repository link.
   - If **yes**, it clones the repo.
   - If **no**, it switches to **Firecrawl** mode.

2. **Firecrawl Process**  
   - Crawls linked pages and collects structured content (HTML, code blocks, text sections).
   - Organizes the data in a “git-like” directory structure for easy integration into AI workflows.

3. **Output**  
   - GitHub repos are cloned into a local directory matching the repo name.
   - Firecrawl exports or logs its structured data so you can review or feed it directly to an AI tool.

## Example Scenarios

- **GitHub Clone for Quick Start**  
  Quickly clone a new project:

  ```sh
  reliverse clone https://github.com/reliverse/recme-npm-library-template as recme
  ```

  Then simply run:

  ```sh
  cd recme && bun i
  ```

- **Crawling Documentation Site**  
  Capture and structure content from an online manual or documentation site for offline analysis or AI ingestion:

  ```sh
  reliverse clone https://docs.example.com
  ```

  You might then pass the output to a chat agent, e.g., `@relinter`, for further processing or analysis.

## Contributing & Support

If you have suggestions, bug reports, or ideas for new features, please [join our Discord community](https://discord.gg/Pb8uKbwpsJ) or check out [our Docs](https://docs.reliverse.org/cli).

If you find Reliverse CLI valuable, consider supporting its continued development through:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)  
- [Patreon](https://patreon.com/blefnk)  
- [PayPal](https://paypal.me/blefony)

Even a simple ⭐ on [GitHub](https://github.com/reliverse/cli) is greatly appreciated!

## License

[MIT](LICENSE) © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
