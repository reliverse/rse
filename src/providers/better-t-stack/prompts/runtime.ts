import { cancel, isCancel, select } from "@clack/prompts";
import pc from "picocolors";

import type {
  ProjectBackend,
  ProjectRuntime,
} from "~/cli/providers/better-t-stack/types.js";

import { DEFAULT_CONFIG } from "~/cli/providers/better-t-stack/constants.js";

export async function getRuntimeChoice(
  runtime?: ProjectRuntime,
  backend?: ProjectBackend,
): Promise<ProjectRuntime> {
  if (backend === "convex") {
    return "none";
  }

  if (runtime !== undefined) return runtime;

  if (backend === "next") {
    return "node";
  }

  const response = await select<ProjectRuntime>({
    message: "Select runtime",
    options: [
      {
        value: "bun",
        label: "Bun",
        hint: "Fast all-in-one JavaScript runtime",
      },
      {
        value: "node",
        label: "Node.js",
        hint: "Traditional Node.js runtime",
      },
    ],
    initialValue: DEFAULT_CONFIG.runtime,
  });

  if (isCancel(response)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
