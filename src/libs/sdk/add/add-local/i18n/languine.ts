import { relinka } from "@reliverse/relinka";
import { execaCommand } from "execa";
import { lookpath } from "lookpath";

export async function useLanguine(projectPath: string) {
  relinka("verbose", `Using: ${projectPath}`);
  if (!(await isLanguineInstalled())) {
    relinka("info", "Installing the translation addon...");
    await execaCommand("bun add -g languine", { stdio: "inherit" });
  }
  relinka(
    "success",
    "Please execute the following command: `languine`",
    "Note: This addon must currently be run manually.",
  );
}

async function isLanguineInstalled() {
  const commandPath = await lookpath("languine");
  return commandPath !== undefined;
}
