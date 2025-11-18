// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/package-manager.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { PackageManager } from "../types";
import { exitCancelled } from "../utils/errors";
import { getUserPkgManager } from "../utils/get-package-manager";

export async function getPackageManagerChoice(packageManager?: PackageManager) {
  if (packageManager !== undefined) return packageManager;

  const detectedPackageManager = getUserPkgManager();

  const response = await selectPrompt<PackageManager>({
    message: "Choose package manager",
    options: [
      { value: "npm", label: "npm", hint: "Node Package Manager" },
      {
        value: "pnpm",
        label: "pnpm",
        hint: "Fast, disk space efficient package manager",
      },
      {
        value: "bun",
        label: "bun",
        hint: "All-in-one JavaScript runtime & toolkit",
      },
    ],
    initialValue: detectedPackageManager,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
