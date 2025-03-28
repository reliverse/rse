import { re } from "@reliverse/relico";
import { isBunPM, isBunRuntime } from "@reliverse/runtime";
import fs from "fs-extra";
import path from "pathe";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import { cliJsrPath } from "~/libs/cfg/constants/cfg-details.js";
import { detectProjectsWithReliverse } from "~/libs/sdk/utils/reliverseConfig/rc-detect.js";

export type MainMenuChoice =
  | "create"
  | "clone"
  | "detected-projects"
  | "isDevTools"
  | "native-cli"
  | "manual"
  | "exit"
  | "ai";

type MainMenuOption = {
  label: string;
  value: MainMenuChoice;
  hint?: string;
};

/**
 * Builds the main menu options based on dev mode, multi-reliverse configs, detected projects, etc.
 */
export async function getMainMenuOptions(
  cwd: string,
  isDev: boolean,
  multireli: ReliverseConfig[],
): Promise<MainMenuOption[]> {
  // Initial multi-config hint (if relevant)
  const multiConfigMsg =
    multireli.length > 0
      ? re.dim(`multi-config mode with ${multireli.length} projects`)
      : "";

  // Detect local projects from the current directory or tests-runtime in dev mode
  const reliverseConfigSearchPath = isDev
    ? path.join(cwd, "tests-runtime")
    : cwd;
  let detectedCount = 0;
  if (await fs.pathExists(reliverseConfigSearchPath)) {
    const detectedProjects = await detectProjectsWithReliverse(
      reliverseConfigSearchPath,
      isDev,
    );
    detectedCount = detectedProjects.length;
  }

  // Show "Detected: N" if we have any local projects
  const detectedHint = detectedCount > 0 ? `Detected: ${detectedCount}` : "";

  // Base menu
  const options: MainMenuOption[] = [
    {
      label: "✨ Create a brand new project",
      hint: multiConfigMsg,
      value: "create",
    },
    {
      label: "🔬 Create/edit project manually",
      // Inject "Detected: N" near the manual creation if we found any
      hint: [multiConfigMsg, detectedHint].filter(Boolean).join(" | "),
      value: "manual",
    },
    {
      label: "🧱 Clone an existing repository",
      hint: multiConfigMsg,
      value: "clone",
    },
    { label: "💬 Chat with Reliverse AI agent", value: "ai" },
    {
      label: "🧰 Open developer tools kit",
      value: "isDevTools",
    },
    {
      label: "👈 Exit",
      value: "exit",
      hint: re.dim("ctrl+c anywhere"),
    },
  ];

  // TODO: remove, deprecated
  // Possibly show "native-cli" if using Bun PM but not running in Bun
  const isBun = await isBunPM();
  if (isBun && !isBunRuntime) {
    const isNativeInstalled = await fs.pathExists(cliJsrPath);
    let msg = "Use";
    if (isNativeInstalled && isBunRuntime) {
      msg = "Configure";
    }
    options.push({
      label: `🚀 ${msg} Bun-native @reliverse/cli`,
      value: "native-cli",
    });
  }

  // TODO: remove, deprecated
  // Insert the manage-projects item if local projects are detected
  if (detectedCount > 0) {
    options.splice(1, 0, {
      label: "📝 Manage project (deprecated)",
      value: "detected-projects",
      hint: re.dim(`Detected: ${detectedCount}`),
    });
  }

  return options;
}
