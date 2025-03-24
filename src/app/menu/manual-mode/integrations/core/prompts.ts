import { re } from "@reliverse/relico";

/**
 * Returns the text content for the final prompt, depending on missing deps or updates.
 */
export function getPromptContent(
  depsMissing: boolean,
  updateAvailable: boolean,
): string {
  if (depsMissing) {
    return re.yellow(
      `Dependencies are missing in your project. Would you like to install them?\n${re.bold(
        "🚨 Note: Certain addons will be disabled until the dependencies are installed.",
      )}`,
    );
  }
  return updateAvailable
    ? re.yellow("Select an action to perform\n(An update is available)")
    : "Select an action to perform";
}
