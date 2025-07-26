import type { RseConfig } from "@reliverse/cfg";

import { detectProjectsWithRseConfig } from "@reliverse/cfg";
import path from "@reliverse/pathkit";
import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { isBunPM, isBunRuntime } from "@reliverse/runtime";

import { cliJsrPath } from "~/libs/sdk/constants";

export type MainMenuChoice =
  | "create"
  | "clone"
  | "detected-projects"
  | "isDevTools"
  | "native-cli"
  | "manual"
  | "exit"
  | "ai"
  | "web-ui";

interface MainMenuOption {
  label: string;
  value: MainMenuChoice;
  hint?: string;
}

/**
 * Builds the main menu options based on dev mode, multi-rsegs, detected projects, etc.
 */
export async function getMainMenuOptions(
  cwd: string,
  isDev: boolean,
  mrse: RseConfig[],
): Promise<MainMenuOption[]> {
  // Initial multi-config hint (if relevant)
  const multiConfigMsg =
    mrse.length > 0
      ? re.dim(`multi-config mode with ${mrse.length} projects`)
      : "";

  // Detect local projects from the current directory or tests-runtime in dev mode
  const rseSearchPath = isDev ? path.join(cwd, "tests-runtime") : cwd;
  let detectedCount = 0;
  if (await fs.pathExists(rseSearchPath)) {
    const detectedProjects = await detectProjectsWithRseConfig(
      rseSearchPath,
      isDev,
    );
    detectedCount = detectedProjects.length;
  }

  // Show "Detected: N" if we have any local projects
  const detectedHint = detectedCount > 0 ? `Detected: ${detectedCount}` : "";

  // Base menu
  const options: MainMenuOption[] = [
    {
      label: "✨ Create a project in terminal",
      hint: multiConfigMsg,
      value: "create",
    },
    {
      label: "💻 Open rse web ui",
      hint: "experimental",
      value: "web-ui",
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
    { label: "💬 Chat with Reliverse AI", value: "ai" },
    {
      label: "🧰 Open developer toolkit",
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
      label: `🚀 ${msg} Bun-native @rse`,
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
