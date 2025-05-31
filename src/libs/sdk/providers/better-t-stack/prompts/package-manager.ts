import { cancel, isCancel, select } from "@clack/prompts";
import pc from "picocolors";

import type { ProjectPackageManager } from "~/libs/sdk/providers/better-t-stack/types";

import { getUserPkgManager } from "~/libs/sdk/providers/better-t-stack/utils/get-package-manager";

export async function getPackageManagerChoice(
  packageManager?: ProjectPackageManager,
): Promise<ProjectPackageManager> {
  if (packageManager !== undefined) return packageManager;

  const detectedPackageManager = getUserPkgManager();

  const response = await select<ProjectPackageManager>({
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

  if (isCancel(response)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
