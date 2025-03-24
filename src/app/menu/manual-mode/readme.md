# Manual Project Builder

> This README file is part of `@reliverse/cli`. Check the root `README.md` for more information.

## TODO

- [x] Create a project if current directory is empty
- [x] Display the reliverse project selector and selected project menu
- [ ] After addon is integrated, ask if user wants to install related cursor rule
- [ ] Implement `Apply everything as configured in reliverse.{ts,jsonc}` option

## Terminology

- Manual Project Builder === Composer Mode
- Integrations === Addons

## Prompts

### ✅ 0. Reliverse main menu

```bash
│  > 🔬 Create/edit project manually
```

### ✅ 1. Project creation

```bash
◆  Reliverse Project Selection
│  Dir C:/B/L/cli/tests-runtime is empty
│  > Create new project
│  Exit
│
◆  How should I name your brand new project?
│  I've just generated a random name for you (press <Enter> to use it): extra-short
│  This name may be used to create the project directory, throughout the project, etc.
│  extra-short
│
◆  What type of project are you creating?
│  This will determine the config files to be generated. If you're unsure, choose Web app.
│  No worries—you can always change it later by editing the project's Reliverse config.
│  Web app (Includes desktop and mobile apps)
│  > Library (Includes clis and extensions)
│
◆  Created new project "extra-short" with minimal Reliverse config.
│  It's recommended to:
│  1. Edit the generated config files as needed.
│  2. Rerun the manual builder to apply changes.
```

### ✅ 2. Project selection

```bash
◆  Reliverse Project Selection
│  Choose an existing project or create a new one.
│  > Edit: extra-short (C:/B/L/cli/tests-runtime/extra-short)
│  Create new project
│  Exit
```

### 3. Project menu

```bash
◆  Manual Builder Mode
│  Select an action to perform
│  > ...OPTIONS
```

**OPTIONS**:

- 🔌 Install dependencies _[IF NOT INSTALLED]_
- 🔃 Update project template _[IF USED ONE]_
- 🟡 api (trpc, orpc)
- 🟡 auth ([better-auth](https://better-auth.com), next-auth, clerk)
- 🟡 db (drizzle, prisma)
- 🟡 i18n ([next-intl](https://next-intl.dev), [languine](https://languine.ai), [gt-libs](https://generaltranslation.com))
- 🟡 payments ([polar](https://polar.sh), [stripe](https://stripe.com))
- 🟡 form ([react-hook-form](https://react-hook-form.com), [tanstack-form](https://tanstack.com/form))
- 🟡 files ([uploadthing](https://uploadthing.com))
- 🟡 web-frameworks ([astro](https://astro.build), [next](https://nextjs.org), [vite](https://vite.dev), [jstack](https://jstack.app))
- 🟡 native-frameworks ([react-native](https://reactnative.dev), [lynx](https://lynxjs.org))
- 🟡 browser-extensions ([wxt](https://wxt.dev), [plasmo](https://plasmo.com))
- 📝 Edit project settings (on [reliverse.org](https://reliverse.org))
- 👈 Exit
