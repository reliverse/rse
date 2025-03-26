# Reliverse CLI: `install` Command

[📦 NPM](https://npmjs.com/@reliverse/cli) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [📚 Docs](https://docs.reliverse.org/cli)

The `reliverse install` command simplifies installing global NPM packages and popular desktop applications directly from your command line. With a user-friendly, interactive prompt system, you can quickly select and install essential tools or specify exactly what you need in one go.

> **Note**: This command is currently in the development and may have some limitations. Feedback is welcome!

## Features

- ⚡ **Interactive Multiselect Installation**
  Choose multiple apps or packages from an interactive checklist.

- 🛠️ **Dual Installation Modes**
  Easily switch between installing global NPM packages or common desktop applications for your OS.

- 💻 **Cross-platform Compatibility**
  Automatically detects your OS and installs apps suitable for macOS, Windows, or Linux.

- 📦 **Quick Direct Installation**
  Install multiple packages and apps directly from the command line with one command.

## Usage

### Interactive Installation

Run the command without arguments to launch an interactive prompt:

```sh
reliverse install
```

You'll see:

```bash
◆ Select Installation Type
│
│ > cli apps
│   desktop apps
```

- **cli apps**: Opens a multiselect prompt listing popular global NPM packages.
- **desktop apps**: Presents you with a list of essential desktop applications tailored to your OS.

Simply select the tools you need and confirm.

### Direct Installation

Install CLIs or desktop apps directly without prompts:

```sh
reliverse i <app1> <app2> ...
reliverse install bun obsidian vscode node biome
```

This immediately installs the selected applications or global NPM packages, automatically handling OS-specific details.

## Supported Desktop Apps

**💡 Coming Soon**:

- **Editors & IDEs**: VSCode, Cursor, Windsurf
- **Productivity**: Obsidian, Notion, Evernote
- **Development Tools**: Git, Node.js, Bun, Pnpm, Docker
- **Utilities**: Postman, Warp, Tabby
- _**and more...**_

## Supported Global NPM Packages

**💡 Coming Soon**:

- `typescript`, `eslint`, `biome`
- `@reliverse/relidler`
- _**and more...**_

## Example Usage

- **Quick install essential development tools**:

```sh
reliverse install bun node vscode biome
```

- **Interactive selection**:

```sh
reliverse install
```

Then follow the interactive prompts to choose from desktop apps or npm packages.

## Contributing & Support

We appreciate your feedback and contributions! Join our [Discord community](https://discord.gg/Pb8uKbwpsJ) or check out the [docs](https://docs.reliverse.org/cli) to get involved.

Support Reliverse development:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)  
- [Patreon](https://patreon.com/blefnk)  
- [PayPal](https://paypal.me/blefony)

Your star ⭐ on [GitHub](https://github.com/reliverse/cli) helps a lot too!

## License

[MIT](LICENSE) © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
