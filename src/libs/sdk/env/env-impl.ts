import { getOrCreateRseConfig } from "@reliverse/cfg";
import { relinka } from "@reliverse/relinka";
import { confirmPrompt } from "@reliverse/rempts";

import { FALLBACK_ENV_EXAMPLE_URL } from "~/libs/sdk/constants";
import { composeEnvFile } from "~/libs/sdk/init/use-template/cp-modules/compose-env-file/cef-mod";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

export async function envArgImpl(isDev: boolean, pathToProject?: string) {
  try {
    // Get project path
    const projectPath = pathToProject ?? getCurrentWorkingDirectory();

    // Get rseg
    const { config } = await getOrCreateRseConfig({
      projectPath,
      isDev,
      overrides: {},
    });

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
