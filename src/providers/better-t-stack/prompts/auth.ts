import { cancel, confirm, isCancel } from "@clack/prompts";
import pc from "picocolors";

import type { ProjectBackend } from "~/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/providers/better-t-stack/constants";

export async function getAuthChoice(
  auth: boolean | undefined,
  hasDatabase: boolean,
  backend?: ProjectBackend,
): Promise<boolean> {
  if (backend === "convex") {
    return false;
  }

  if (!hasDatabase) return false;

  if (auth !== undefined) return auth;

  const response = await confirm({
    message: "Add authentication with Better-Auth?",
    initialValue: DEFAULT_CONFIG.auth,
  });

  if (isCancel(response)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
