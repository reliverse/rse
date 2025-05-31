import { relinka } from "@reliverse/relinka";
import { confirmPrompt } from "@reliverse/rempts";

import type { RseConfig } from "~/libs/sdk/cfg/cfg-types";

/**
 * A string literal union for either 'gitBehavior' or 'deployBehavior'
 */
type DecisionKey = "gitBehavior" | "deployBehavior";

/**
 * This function handles the final "yes/no" decision, taking into account:
 * - The config's behavior key (autoYes, autoNo, prompt)
 * - Whether skipPrompts is true
 */
export async function decide(
  config: RseConfig,
  behaviorKey: DecisionKey,
  title: string,
  content: string | undefined,
  defaultValue: boolean,
  skipPrompts: boolean,
): Promise<boolean> {
  try {
    let behavior = config?.[behaviorKey] ?? "prompt";

    // If skipPrompts is true AND the config is set to "prompt",
    // we override that behavior to "autoYes" so no user input is needed.
    if (skipPrompts && behavior === "prompt") {
      behavior = "autoYes";
    }

    switch (behavior) {
      case "autoYes":
        relinka("verbose", `Auto-answering YES to: "${title}"`);
        return true;
      case "autoNo":
        relinka("verbose", `Auto-answering NO to: "${title}"`);
        return false;
      // default is "prompt":
      default:
        return await confirmPrompt({
          title,
          content: content ?? "",
          defaultValue,
        });
    }
  } catch (error) {
    relinka(
      "error",
      "Failed to get decision:",
      error instanceof Error ? error.message : String(error),
    );
    return defaultValue;
  }
}
