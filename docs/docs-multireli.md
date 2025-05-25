# 🧪 `rse multireli`

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

The `multireli` command lets you define multiple rse config files and use them to generate multiple projects in a single run.  
Useful when you want to scaffold several related projects at once — like a monorepo, microservices setup, or just different playgrounds to experiment with.

## 📦 How it works

When you run:

```bash
rse multireli
```

rse looks for config files inside this directory:

```bash
.rse/multireli/
```

Each file should follow this pattern:

```bash
{index}-rse.config.ts
# or
{index}-rse.config.json
```

Example:

```bash
.rse/multireli/
├── 1-rse.config.ts
├── 2-rse.config.ts
└── 3-rse.config.json
```

Each config will be passed into the CLI just like a single project setup.  
rse will run through them one by one and generate all the projects automatically.

## 🛠️ Use Case Example

Let's say you want:

- A landing page
- A marketing site
- A main web app
- A CMS admin panel

You can create separate config files for each, place them in `.rse/multireli/`, and let rse do the heavy lifting.

## 🧠 Tips

- You can use `.ts` or `.json` config formats — whatever you're comfortable with.
- Config files should follow the same structure as the one used in `rse cli`.
- Add a prefix (like `1-`, `2-`, etc.) to control the execution order.
- Perfect for workspaces, Nx, TurboRepo, or just organizing side projects cleanly.

## 🚀 Generate configs

```bash
rse multireli
```

Sit back. Let rse CLI do its thing 🛠️✨
