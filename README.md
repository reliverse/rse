# rse (prev. reliverse cli) — [reliverse.org](https://reliverse.org)

[sponsor](https://github.com/sponsors/blefnk) — [discord](https://discord.gg/Pb8uKbwpsJ) — [repo](https://github.com/reliverse/rse) — [npm](https://npmjs.com/@reliverse/rse) — [introduction](https://blefnk.reliverse.org/blog/my-projects/cli)

**@reliverse/rse** is your all-in-one companion for bootstrapping and improving any kind of projects (especially web apps built with frameworks like Next.js) — whether you're kicking off something new or upgrading an existing app. It is also a little AI-powered toolbox in your terminal, ready to help with coding, refactoring, image gen, and more.

## what it can do

- 🦾 **superapp for devs.** one cli, tons of features. spin up, refactor, deploy, ai — all in one place.
- 🚀 **start new or load up** templates in seconds.
- 🌐 **push** to github, deploy to vercel — all in one go.
- 🤝 **different providers.** don't like the recommended `rse-stack`? launch `rse` and choose `better-t-stack` or any other provider for your project bootstrap. rse won't mind (promise). [learn more](https://reliverse.org/rse/providers).
- 🔧 **refactor** safely, add popular libs, and keep your codebase happy.
- ⚙️ **automate** boring setup (eslint, env files, etc) — let the cli handle it.
- 🏗️ **works great with next.js**, and plays nice with other frameworks too.
- ⏬ **auto-clones repos**/templates and configures them smartly.
- 🔌 **integrate** tools into your codebase. use `create/edit project manually` (or `rse init`).
- 🤖 **chat with rse ai** or let agentic tools like relinter suggest improvements.

### stack providers

the main principle on which the rse ecosystem stands is collaboration and creating the most convenient dx possible. the more friends we have, the better our projects become. that's why rse doesn't strive to be the only one—rse just strives to be really useful. the usefulness of rse is that you don't need to install many different tools to do many different things. rse aims to become an all-in-one tool that runs the tools best suited for your many tasks.

that's why rse gives you the opportunity to use not only its native rse-stack for bootstrapping your project, but also the stacks of our good friends. here's what you can choose from after you click `create a brand new project`:

- ✅ [rse-stack](https://reliverse.org/rse/providers/rse-stack) ([donate](https://github.com/sponsors/blefnk))
- 🏗️ [better-t-stack](https://reliverse.org/rse/providers/better-t-stack) ([donate](https://github.com/sponsors/AmanVarshney01))

> want to add your/someone else's cli? please open a pr or [create an issue](https://github.com/rse/rse/issues/new).

by choosing a stack other than rse-stack, you will still have access to all the features provided by rse—such as pushing to github, deploying to vercel, further updating your bootstrapped project, and so on.

**legend**:

- ✅ well tested
- 🏗️ not well tested yet
- 🔜 coming soon

## getting started

make sure you have git, node.js, and bun/pnpm/yarn/npm installed.

### install

1. **install globally**:

   ```sh
   bun i -g @reliverse/rse
   ```

   **or update:**

   ```sh
   rse update
   ```

2. **run and enjoy**:

   ```sh
   rse cli
   ```

a `.config/rse.{ts,jsonc}` file is generated on first run.  
customize it to fit your project and tweak cli behavior.  
changes apply on next launch (hot-reload coming soon).

## show some love 🫶

if `@reliverse/rse` saved you time or made you smile:

- support on [github sponsors](https://github.com/sponsors/blefnk)
- or drop a ⭐️ on [github](https://github.com/reliverse/rse)

it helps more than you think! thanks for being here.

## commands

from bootstrapping projects to ai superpowers — here's what rse cli can do.

### notes

- all commands and flags are optional. rse guides you, even if you skip arguments.
- `rse cli` is your all-in-one entry point — it includes everything.
- prefer quick access or running in ci/cd? use specific commands directly.
- run `rse <command> --help` to see options and flags.

### core commands

- `rse cli` — launch the interactive wizard to create or boost your project.
- `rse logout` — logs you out and clears credentials.
- `rse studio` — opens the rse studio — the visual brain center of your local rse memory.
- `rse --help` — shows all available commands and usage tips.

### ai commands ([docs](./src/cli/docs/docs-ai.md))

- `rse ai <prompt>` — your terminal sidekick. ask questions, get help, or just chat with rse ai.
- `rse ai code <prompt> <paths>` — let ai generate or improve code across the given paths.
- `rse ai gen <prompt>` — describe an image and ai will create it, saving to your selected upload provider.
- `rse ai lint <prompt> <paths>` — smart linting with ai. catches issues, suggests fixes, cleans things up.

### init/add commands ([docs](./src/cli/docs/docs-add.md))

- `rse init` — kickstart a new minimal rse project. pick your direction and go.
- `rse add` _(no args)_ — same as `rse init`, but with different prompts depending on the folder.
- `rse add <something>` — add essentials or extras (api, auth, db, payments, i18n, ai tools, uploaders, forms, etc) — all integrated in seconds.
- `rse add -g <something>` _(🔜 will be moved to `@reliverse/hub`)_ — install global clis (eslint, bun, stripe, code, obsidian, etc) from your terminal.
- `rse add rule <something>` — browse and install ai ide rules for rse, cursor, windsurf, copilot, and more — with smart caching and auto-conversion to `.mdc` if needed.

### additional

- `rse clone` ([docs](./src/cli/docs/docs-clone.md)) — clone a github repo (just paste the link), or convert a webpage into llm-ready content.
- `rse cmod` ([docs](./src/cli/docs/docs-cmod.md)) — apply codemods for quick, safe refactoring (ai or presets).
- `rse env` ([docs](./src/cli/docs/docs-env.md)) — generate a .env file from your .env.example with an interactive wizard.
- `rse mrse` ([docs](./src/cli/docs/docs-mrse.md)) — batch-generate multiple rse config files for multiple projects.
- `rse upload` ([docs](./src/cli/docs/docs-upload.md)) — upload media files (images, etc) to providers like uploadthing and uploadcare.
- `rse sync` _(coming soon)_ — sync your local @reliverse/rse memory with your rse ai on [reliverse.org](https://reliverse.org).

## api (for advanced users)

- the sdk lets you build custom rse cli plugins, interact with [reliverse.org](https://reliverse.org), or power up your own clis.
- no need to reinvent the wheel — [@blefnk](https://github.com/blefnk) already took care of the hard parts.
- if it saves you time, [consider making a small donation](https://github.com/sponsors/blefnk) 🩷 to support ongoing development.

```sh
bun add @reliverse/rse-sdk
```

## contribute, please 😽

- everything you see in rse so far is **built by one person** ([@blefnk nazar kornienko](https://github.com/blefnk)) — with love, caffeine, and way too many terminal tabs.
- got feedback, ideas, bugs, or just wanna vibe? [hop into my discord](https://discord.gg/pb8ukbwpsj) — i'd love to chat.
- whether you want to code, brainstorm, fix typos, or just hang out — you're always welcome here.  
  no pressure, no gatekeeping — just good energy and open-source fun.

### <🏗️1> come together, right now

two ways to clone this repo and contribute:

**classic way**:

```bash
git clone https://github.com/rse/rse.git
cd cli
code . # opens vscode
```

**rse way**:

```bash
rse cli
> clone an existing repository
> developer related  
> rse  
> cli
> y/n # opens default editor
```

boom. you're in.

### <🏗️2> you're a magician, do magic

1. run `bun latest` to install dependencies and keep things fresh.
2. use ai (rse, cursor, whatever floats your dev boat) or write code manually.
3. `bun dev:command` works just like `rse <command> --dev`.
4. run `bun check` to make sure everything's clean and happy.
5. all done? commit and push your changes your way:

**classic way**:

```bash
git add .
git commit -m "your commit message"
git push
```

**rse way**:

```bash
rse cli
> commit
<your commit message>
<press enter to push>
```

### <🏗️3> what a great time to live

- all done? high five! 🖐️
- head to [repo](https://github.com/rse/rse/pulls) & open a pr.
- that's it. you're amazing.

thanks for being part of this!

## shoutout 😘

- [amanvarshney01/create-better-t-stack](https://github.com/amanvarshney01/create-better-t-stack#readme) ([donate](https://github.com/sponsors/amanvarshney01))
- [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app#readme) ([donate](https://github.com/sponsors/juliusmarminge))

## stand with ukraine

- 💙 help fund drones, medkits, and victory.
- 💛 every dollar helps stop [russia's war crimes](https://war.ukraine.ua/russia-war-crimes) and saves lives.
- 👉 [donate now](https://u24.gov.ua), it matters.

## stand with reliverse

- ⭐ [star the repo](https://github.com/reliverse/rse) to help reliverse community grow.
- 🦄 follow this project's author, [nazar kornienko](https://github.com/blefnk) & [reliverse](https://github.com/reliverse), to get updates about new projects.
- 💖 [become a sponsor](https://github.com/sponsors/blefnk) and power the next wave of tools that _just feel right_.
- 🧑‍🚀 every bit of support helps keep the dream alive: dev tools that don't suck.

> Built with love. Fueled by purpose. Running on caffeine.

## license

[mit](LICENSES) © 2025 [nazar kornienko (blefnk)](https://github.com/blefnk), [reliverse](https://github.com/reliverse)
