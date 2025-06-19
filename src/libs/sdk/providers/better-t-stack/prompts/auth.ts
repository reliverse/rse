import { re } from "@reliverse/relico";
import { cancel, confirm, isCancel } from "@reliverse/rempts";

import type { Backend } from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getAuthChoice(
  auth: boolean | undefined,
  hasDatabase: boolean,
  backend?: Backend,
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
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
