// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { PackageManager } from "../types";
import { exitCancelled } from "../utils/errors";

export async function getPackageManagerChoice(packageManager?: PackageManager) {
  if (packageManager !== undefined) return packageManager;

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
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
