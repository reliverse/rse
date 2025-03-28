import { confirmPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import { FALLBACK_ENV_EXAMPLE_URL } from "~/libs/cfg/constants/cfg-details.js";
import { composeEnvFile } from "~/libs/sdk/init/use-template/cp-modules/compose-env-file/cef-mod.js";
import { getReliverseConfig } from "~/libs/sdk/utils/reliverseConfig/rc-mod.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export async function envArgImpl(isDev: boolean, pathToProject?: string) {
  try {
    // Get project path
    const projectPath = pathToProject ?? getCurrentWorkingDirectory();

    // Get reliverse config
    const { config } = await getReliverseConfig(projectPath, isDev, {});

    // Prompt user about secret masking
    const maskInput = await confirmPrompt({
      title:
        "Do you want to mask secret inputs (e.g., GitHub token) in the next steps?",
      content:
        "Regardless of your choice, your data will be securely stored on your device.",
    });

    // Compose .env file
    await composeEnvFile(
      projectPath,
      FALLBACK_ENV_EXAMPLE_URL,
      maskInput,
      false,
      config,
      false,
    );
  } catch (error) {
    relinka(
      "error",
      "Failed to compose .env file:",
      error instanceof Error ? error.message : JSON.stringify(error),
    );
    process.exit(1);
  }
}
