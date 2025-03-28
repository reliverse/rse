import { selectPrompt } from "@reliverse/prompts";
import { re } from "@reliverse/relico";

const KNOWN_APPS = ["relivator"];
const KNOWN_LIBS = ["recme", "reinit"];

export async function askAppOrLib(projectName: string): Promise<"app" | "lib"> {
  if (KNOWN_APPS.includes(projectName)) {
    return "app";
  }
  if (KNOWN_LIBS.includes(projectName)) {
    return "lib";
  }

  const type = await selectPrompt({
    title: "What type of project are you creating?",
    content: `This will determine the config files to be generated. If you're unsure, choose ${re.bold("Web app")}.\nNo worries—you can always change it later by editing the project's Reliverse config.`,
    options: [
      {
        label: "Web app",
        value: "app",
        hint: "Includes desktop and mobile apps",
      },
      {
        label: "Library",
        value: "lib",
        hint: "Includes clis and extensions",
      },
    ],
  });

  return type;
}
