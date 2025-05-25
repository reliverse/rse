import { anykeyPrompt } from "@reliverse/rempts";
import { re } from "@reliverse/relico";

export async function showAnykeyPrompt() {
  const notification = `🤖 Hello, my name is rseyour assistant for creating new web projects, integrating new features, and making advanced codebase modifications.\n✨ I'm constantly evolving, with even more features on the way! In the future, I'll be able to work with not only web apps. Let's get started!\n│  ============================\n│  ${re.bold("Press any key to continue...")}`;

  await anykeyPrompt(notification);
}
