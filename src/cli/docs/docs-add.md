# Reliverse CLI: `add` command

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

[📦 NPM](https://npmjs.com/@reliverse/cli) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [📚 Docs](https://docs.reliverse.org/cli)

**@reliverse/cli** includes a **`reliverse add <something>`** subcommand—internally known as the “Manual Project Builder” or **Composer Mode**. This interactive tool helps you **create, customize, and integrate** new or existing projects with **Reliverse Addons** (i.e., integrations for APIs, auth, i18n, DB, frameworks, etc.).

The `reliverse add -g <something>` command simplifies installing global NPM packages and popular desktop applications directly from your command line. With a user-friendly, interactive prompt system, you can quickly select and install essential tools or specify exactly what you need in one go.

**Note**: Running `reliverse add` without a target (aka `<something>`) does the same thing as `reliverse init`.

`reliverse add rule <something>` — Browse and install AI IDE rules for Reliverse, Cursor, Windsurf, Copilot, and more — official and community-sourced. Powered by smart caching and auto-conversion to `.mdc` format when needed.

## Features

- 🏗️ **Project Creation**  
  Automatically generates a new Reliverse project and minimal config, if your current directory is empty.

- 🔌 **Addons & Integrations**  
  Easily integrate popular tools like Next.js, React Native, Prisma, or i18n solutions in just a few steps.

- 📝 **Configurable & Re-runnable**  
  Edits are stored in `reliverse.jsonc` or `reliverse.ts`. You can rerun the manual builder to apply changes.

- ⚡ **Quick Setup**  
  Automates tasks like installing dependencies, updating templates, or setting up key config files.

## Terminology

- **Manual Project Builder** = `bun add` (without any params) = **Composer Mode**: Composer mode is perfect when you want full control over your stack, one step at a time — with an interactive CLI experience. Think of it as your project's composer, conductor, and toolbox — all in one.  
- **Integrations** = **Addons**

## Usage

Install or update **@reliverse/cli**:

```sh
bun i -g @reliverse/cli
reliverse update
```

Run the **add** command to open the manual builder:

```sh
reliverse add something
```

- If **your current directory is empty**, the builder will offer to **create** a new project.
- If you already have an existing project or multiple projects, you'll see a **project selector** to edit or create.

## Example Flow

Below is an overview of the prompts and menus you'll encounter.

### 1. Main Menu Prompt

```bash
│  > 🔬 Create/edit project manually
```

Selecting this opens Composer Mode to either create or configure a project.

### 2. Project Creation (If Directory Is Empty)

```bash
◆  Reliverse Project Selection
│  Dir C:/B/L/cli/tests-runtime is empty
│  > Create new project
│  Exit
│
◆  How should I name your brand new project?
│  I've just generated a random name for you (press <Enter> to use it): extra-short
│
◆  What type of project are you creating?
│  Web app (Includes desktop and mobile apps)
│  > Library (Includes clis and extensions)
│
◆  Created new project "extra-short" with minimal Reliverse config.
│  It's recommended to:
│    1. Edit the generated config files as needed.
│    2. Rerun the manual builder to apply changes.
```

### 3. Project Selection (If Directory Is Not Empty)

```bash
◆  Reliverse Project Selection
│  Choose an existing project or create a new one.
│  > Edit: extra-short (C:/B/L/cli/tests-runtime/extra-short)
│  Create new project
│  Exit
```

### 4. Project Menu

```bash
◆  Manual Builder Mode
│  Select an action to perform
│  > ...OPTIONS
```

#### Available OPTIONS

- 🔌 **Install dependencies** (if not installed)  
- 🔃 **Update project template** (if originally cloned from a template)  
- 🟡 **api** (trpc, orpc)  
- 🟡 **auth** ([better-auth](https://better-auth.com), next-auth, clerk)  
- 🟡 **db** (drizzle, prisma)  
- 🟡 **i18n** ([next-intl](https://next-intl.dev), [languine](https://languine.ai), [gt-libs](https://generaltranslation.com))  
- 🟡 **payments** ([polar](https://polar.sh), [stripe](https://stripe.com))  
- 🟡 **form** ([react-hook-form](https://react-hook-form.com), [tanstack-form](https://tanstack.com/form))  
- 🟡 **files** ([uploadthing](https://uploadthing.com))  
- 🟡 **web-frameworks** ([astro](https://astro.build), [next](https://nextjs.org), [vite](https://vite.dev), [jstack](https://jstack.app))  
- 🟡 **native-frameworks** ([react-native](https://reactnative.dev), [lynx](https://lynxjs.org))  
- 🟡 **browser-extensions** ([wxt](https://wxt.dev), [plasmo](https://plasmo.com))  
- 📝 **Edit project settings** (on [reliverse.org](https://reliverse.org))  
- 👈 **Exit**

## TODO

- [x] Create a project if the current directory is empty  
- [x] Display the Reliverse project selector and selected project menu  
- [ ] After an addon is integrated, ask if the user wants to install the related cursor rule  
- [ ] Implement “Apply everything as configured in `reliverse.{ts,jsonc}`” option  

---

## Global Apps

## Global Apps Features

- ⚡ **Interactive Multiselect Installation**
  Choose multiple apps or packages from an interactive checklist.

- 🛠️ **Dual Installation Modes**
  Easily switch between installing global NPM packages or common desktop applications for your OS.

- 💻 **Cross-platform Compatibility**
  Automatically detects your OS and installs apps suitable for macOS, Windows, or Linux.

- 📦 **Quick Direct Installation**
  Install multiple packages and apps directly from the command line with one command.

## Global Apps Usage

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

Have feature requests or feedback? We'd love to hear from you:

- Join the conversation on [Discord](https://discord.gg/Pb8uKbwpsJ).
- Check out our [Docs](https://docs.reliverse.org/cli) for detailed guidance.

If Reliverse saves you time and helps your workflow, please consider supporting its continued development:

- [GitHub Sponsors](https://github.com/sponsors/blefnk)  
- [Patreon](https://patreon.com/blefnk)  
- [PayPal](https://paypal.me/blefony)

A star on [GitHub](https://github.com/reliverse/cli) is also greatly appreciated!

## License

[MIT](LICENSE) © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
