import { confirmPrompt } from "@reliverse/prompts";

export async function shouldInitGit(isDev: boolean) {
  return await confirmPrompt({
    title: "Do you want to initialize a Git repository?",
    content: "This will create a `.git` folder in your project.",
    defaultValue: !isDev,
  });
}
