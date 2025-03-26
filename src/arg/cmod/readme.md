# Reliverse CLI: `cmod` Command

[📦 NPM](https://npmjs.com/@reliverse/cli) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [📚 Docs](https://docs.reliverse.org/cli)

The `reliverse cmod` command allows you to easily apply powerful codemods (code modifications) to your project. Codemods automate complex or repetitive refactoring tasks, saving significant time and effort while ensuring consistency across your codebase.

## Features

- 🧩 **Interactive Codemod Selection**  
  Easily select and apply codemods from an intuitive prompt.

- ⚡ **Instant Refactoring**  
  Quickly apply multiple code transformations in one go.

- 🚀 **Safe and Reversible**  
  Codemods are applied intelligently, allowing you to review and revert changes as needed.

- 🎯 **Customized Refactoring**  
  Supports configurable codemods tailored to your project's specific needs.

## Getting Started

Install or update **@reliverse/cli**:

```sh
bun i -g @reliverse/cli
reliverse update
```

## Usage

### Interactive Mode

Run `reliverse cmod` to launch the interactive codemod selection:

```sh
reliverse cmod
```

You'll be prompted with a checklist of available codemods to apply:

- ✅ Select the codemods you want.
- ✅ Confirm your selection to apply the changes.

### Direct Mode

Directly apply codemods by specifying their names:

```sh
reliverse cmod use-react-router-v6 migrate-to-nextjs-14
```

This command will instantly run the selected codemods without the interactive prompt.

## Example Codemods

Common codemods provided by Reliverse include:

- **Framework migrations**:
  - React Router v5 → v6
  - Next.js v13 → v14
- **Syntax and API upgrades**:
  - React Class Components → Functional Components
  - JavaScript → TypeScript
- **Code Quality & Standards**:
  - Convert to ES Modules
  - ESLint and Biome rules standardization

## Example Usage

Quickly migrate your codebase to React Router v6 and convert class components:

```sh
reliverse cmod use-react-router-v6 class-to-functional
```

Interactively select and apply refactoring codemods:

```sh
reliverse cmod
```

## Contributing & Support

We're always looking to expand our codemod collection and enhance the Reliverse experience:

- Join our [Discord community](https://discord.gg/Pb8uKbwpsJ)
- Check our [Docs](https://docs.reliverse.org/cli)

Consider supporting us:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)
- [Patreon](https://patreon.com/blefnk)
- [PayPal](https://paypal.me/blefony)

A simple star ⭐ on [GitHub](https://github.com/reliverse/cli) is always appreciated!

## License

[MIT](LICENSE) © 2025 [blefnk Nazarii Korniienko](https://github.com/blefnk)
