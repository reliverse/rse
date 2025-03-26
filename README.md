# @reliverse/cli | Reliverse CLI | [reliverse.org](https://reliverse.org)

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [✨ Repo](https://github.com/reliverse/cli-website-builder) • [📦 NPM](https://npmjs.com/@reliverse/cli) • [📚 Docs](https://blefnk.reliverse.org/blog/my-products/reliverse-cli)

**@reliverse/cli** is your all-in-one command-line companion for setting up and enhancing web projects—whether you’re starting fresh or upgrading an existing app.

## Features

- 🚀 Spin up new web apps or manage existing templates in a flash.
- 🔧 Safely refactor code and integrate popular libraries into your workflow.
- ⚙️ Set up ESLint, Biome, env files, and more without manual hassle.
- 🏗️ Enjoy seamless compatibility with Next.js and beyond.
- 📝 Clone pre-built templates and merge them conflict-free right into your project.
- 🌐 Quickly create GitHub repos, push commits, and deploy to Vercel in a single command.
- 🔌 Use `🔬 Create/edit project manually` to enable extra features and integrations.
- 🤖 Speak with Reliverse AI or use powerful agents like Relinter.

## Getting Started

Ensure git, node.js, and bun/pnpm/yarn/npm are installed. Then:

### CLI Installation

1. **Install globally**:

   ```sh
   bun i -g @reliverse/cli
   ```

   **Or update as needed**:

   ```sh
   reliverse update
   ```

2. **Run and enjoy**:

   ```sh
   reliverse cli
   ```

   This command will guide you through creating or configuring a project with an interactive wizard.

## CLI Commands

- `reliverse cli`  
  Starts the interactive wizard to create, configure, or enhance your project.

- `reliverse ai`  
  Speak with Reliverse AI or use powerful agents like Relinter.

- `reliverse login` / `reliverse logout`  
  Log in or out of Reliverse services.

- `reliverse studio`  
  Launches the Reliverse Studio interface.

- `reliverse --help`  
  Displays all available commands and usage info.

## Configuration

When you run `reliverse cli`, a `reliverse.jsonc` or `reliverse.ts` file is created in your project’s root directory. Customize it to tweak CLI behavior—any changes take effect the next time you start the CLI.

## Installing Other Templates

Inside the `reliverse cli` wizard, choose **“Clone an existing repository”** to point the CLI at any public GitHub repo:

1. Provide the repository link.  
2. Reliverse will automatically clone and configure it, merging files as needed.

## Collaborate & Contribute

We love community input! Check out our [Contributing Guide](https://docs.reliverse.org/intro/contributing) for instructions on getting involved or proposing new features. If you’re interested in deeper collaboration or partnerships, [join our Discord](https://discord.gg/Pb8uKbwpsJ) to chat directly with the team.

## Support

If Reliverse saves you time and effort, please consider supporting its development:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)  
- [Patreon](https://patreon.com/blefnk)  
- [PayPal](https://paypal.me/blefony)

Even a simple ⭐ on [GitHub](https://github.com/reliverse/cli) shows your love. Thank you!

## License

[MIT](./LICENSE) © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
