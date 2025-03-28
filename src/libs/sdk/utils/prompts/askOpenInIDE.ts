import { confirmPrompt, relinka } from "@reliverse/prompts";
import { execa } from "execa";

import { isVSCodeInstalled } from "~/libs/sdk/utils/handlers/isAppInstalled.js";

export async function askOpenInIDE({
  isDev,
  projectPath,
  enforce = false,
}: {
  isDev: boolean;
  projectPath: string;
  enforce?: boolean;
}) {
  if (isDev) {
    return;
  }

  let shouldOpenIDE: boolean;

  if (enforce) {
    shouldOpenIDE = true;
  } else {
    shouldOpenIDE = await confirmPrompt({
      title: "Do you want to open the project in your editor?",
      defaultValue: false,
    });
  }

  if (!shouldOpenIDE) {
    return;
  }

  const vscodeInstalled = isVSCodeInstalled();
  relinka(
    "info-verbose",
    vscodeInstalled
      ? "Opening bootstrapped project in VSCode-based IDE..."
      : "Trying to open project in default IDE...",
  );
  try {
    // Spawn the IDE process in detached mode
    // so it doesn't block subsequent actions
    await execa("code", [projectPath], {
      detached: true,
      stdio: "ignore",
    });
  } catch (error) {
    relinka(
      "error",
      "Error opening project in IDE:",
      error instanceof Error ? error.message : String(error),
      `Try manually: code ${projectPath}`,
    );
  }
}
