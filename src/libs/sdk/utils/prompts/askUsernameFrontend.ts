import type { RseConfig } from "@reliverse/cfg";

import { updateRseConfig } from "@reliverse/cfg";
import { re } from "@reliverse/relico";
import { inputPrompt, deleteLastLine } from "@reliverse/rempts";

import { DEFAULT_CLI_USERNAME } from "~/libs/sdk/constants";

// TODO: make it reliverse memory-based again instead of rse config-based
export async function askUsernameFrontend(
  config: RseConfig,
  shouldAskIfExists: boolean,
): Promise<string | null> {
  if (!shouldAskIfExists && config.projectAuthor && config.projectAuthor !== "")
    return config.projectAuthor;

  const previousName =
    typeof config.projectAuthor === "string" ? config.projectAuthor : "";
  const hasPreviousName = previousName !== "";

  // Determine placeholder and content based on previous config
  const placeholder = hasPreviousName ? previousName : DEFAULT_CLI_USERNAME;
  const content = hasPreviousName
    ? `Last used name: ${re.cyanBright(placeholder)} (just press <Enter> to use it again)`
    : `You can press Enter to use the default name: ${re.cyanBright(DEFAULT_CLI_USERNAME)}`;

  // Prompt the user for a name
  const userInput = await inputPrompt({
    title:
      "Enter a name/username for the frontend (e.g. footer, contact page, etc.):",
    content,
    placeholder: hasPreviousName
      ? "No worries about @ symbol anywhere, I'll add it for you."
      : `[Default: ${placeholder}] No worries about @ symbol anywhere, I'll add it for you.`,
    defaultValue: hasPreviousName ? previousName : DEFAULT_CLI_USERNAME,
  });

  // If user presses Enter (empty input):
  // - If there's a previous name, use it without saving to memory again
  // - If no previous name, use DEFAULT_CLI_USERNAME and save it
  const trimmedInput = userInput.trim();
  if (trimmedInput === "") {
    if (hasPreviousName) {
      return previousName;
    }
    await updateRseConfig(
      process.cwd(),
      { projectAuthor: DEFAULT_CLI_USERNAME },
      false,
    );
    deleteLastLine();
    return DEFAULT_CLI_USERNAME;
  }

  // User provided a new name, save it to memory
  await updateRseConfig(process.cwd(), { projectAuthor: trimmedInput }, false);
  return trimmedInput;
}
