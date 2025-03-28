# 🔐 `reliverse env`

> **Note**: This command is currently in the development and may have some limitations. This README.md will be updated over time. Feedback is welcome!

Need a `.env` file but don't want to copy things manually or mess it up?  
This command auto-generates a `.env` file based on your `.env.example`.  
Fast, safe, and typo-proof.

## 🛠️ How to use

Just run:

```bash
reliverse env
```

Reliverse will:

- Look for a `.env.example` file in your project root
- Copy its contents into a new `.env` file
- Leave placeholders as-is (so you can fill them in)
- Skip existing `.env` files unless you use a flag to overwrite

## ⚙️ Options

| Flag          | Description                     |
|---------------|---------------------------------|
| `--force`     | Overwrite existing `.env` file  |
| `--path`      | Use a custom example file path  |
| `--output`    | Set custom output path          |

Example:

```bash
reliverse env --path .env.local.example --output .env.local
```

## 💡 Why it's useful

- Saves you from accidentally overwriting or misnaming `.env` files
- Speeds up onboarding when working across teams or templates
- Plays nice with Relivator, Vercel, and most modern setups

## 🔁 Typical workflow

```bash
git clone my-cool-template
cd my-cool-template
reliverse env
bun dev
```

Boom. You're ready to go 🚀
