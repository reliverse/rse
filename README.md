# @reliverse/cli | Reliverse CLI | [reliverse.org](https://reliverse.org)

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/Pb8uKbwpsJ) • [✨ Repo](https://github.com/reliverse/cli) • [📦 NPM](https://npmjs.com/@reliverse/cli) • [📚 Docs](https://blefnk.reliverse.org/blog/my-products/reliverse-cli)

**@reliverse/cli** is your all-in-one command-line companion for setting up and enhancing web projects—whether you're starting fresh or upgrading an existing app. It also empowers you to build virtually anything else by leveraging the power of AI like code lint, image generation, and more.

## Features

- 🦾 Reliverse makes things easier for anyone. You have a single superapp. It has everything to develop anything.
- 🚀 For example, you can spin up new web apps or manage existing templates in a flash.
- 🔧 Safely refactor code and seamlessly integrate popular libraries into your workflow.
- ⚙️ Automate ESLint, Biome, env file setup, and more.
- 🏗️ Seamlessly compatible with Next.js and many other frameworks.
- 📝 Clone pre-built templates and merge them conflict-free into your projects.
- 🌐 Instantly create GitHub repos, commit changes, and deploy to Vercel with a single command.
- 🔌 Utilize the `🔬 Create/edit project manually` feature to access additional functionalities and integrations.
- ⏬ Reliverse automatically clones repos/templates and configures them, handling file conflicts as needed.
- 🤖 Interact with Reliverse AI and with powerful agentic tools such as Relinter (Reliverse Linter).

## Getting Started

Ensure Git, Node.js, and bun•pnpm•yarn•npm are installed. Then:

### Installation

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

  `.reliverse/reliverse.config.{ts,jsonc}` is generated on first run.
  Customize it to fit your project and tweak CLI behavior.
  Changes apply next launch (hot-reload coming soon).

## Commands

- 🧙 `reliverse cli` — Spin up an interactive wizard to create, configure, or boost your project.
- 🤖 `reliverse ai` — Talk to Reliverse AI or let it run agentic tools like Relinter. [Learn more](./src/arg/ai/readme.md).
- 🧼 `reliverse logout` — Time for a clean slate? Logs you out and forgets your credentials.
- 🖥️ `reliverse studio` — Opens the Reliverse Studio — your Reliverse’s visual brain center.
- 🆘 `reliverse --help` — Lost in flags? This brings up all commands and usage tips.

## TODO

- [x] Build a bunch of useful stuff
- [ ] Release V2 when all features will be stable
- [ ] Make sure Reliverse CLI handles full dev workflows

## Contribute, please 😽

- All currently created things related to Reliverse are made by one person ([@blefnk Nazar Kornienko](https://github.com/blefnk)).
- Got something on your mind? Wanna suggest an idea, report a bug, or just hang out? [Hop into my Discord](https://discord.gg/Pb8uKbwpsJ) and say hi — I’m the dev, and I’d love to chat!
- It's all for devs who like to build cool stuff. If that sounds like you, I’d seriously appreciate your help!
- Whether you wanna code, brainstorm, fix typos, or just vibe with the vision — you’re always welcome.  
- No pressure, no gatekeeping, just good energy and open-source fun.

### Come together, right now

```bash
bun i -g @reliverse/cli
reliverse cli
> 🧱 Clone an existing repository  
> Developer related  
> reliverse  
> cli  
> fork
> Open in editor
```

Boom. You're in.

### You're a magician, do magic

1. Run `bun latest` to get things up to date.
2. Use AI (Reliverse, Cursor, whatever you like) or just do your thing manually.
3. Run `reliverse cli` in the root of the cloned repo.
4. Select: `> Commit and push`

### What a great time to live

- Done? Head to GitHub & Open a PR
- And that’s it! You’re awesome 🤗

## Shoutout

Reliverse CLI was inspired by this gem:  

- [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app#readme)

## Show some love 🫶

If `@reliverse/cli` saved you time or made you smile:

- Support on [GitHub Sponsors](https://github.com/sponsors/blefnk)
- Or just drop a ⭐️ on [GitHub](https://github.com/reliverse/cli)

It helps more than you think! Thanks for being here!

## License

💖 [MIT](./LICENSE) © 2025 [blefnk (Nazar Kornienko)](https://github.com/blefnk)
