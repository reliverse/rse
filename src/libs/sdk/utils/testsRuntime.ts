import { ensuredir } from "@reliverse/fs";
import { relinka } from "@reliverse/prompts";
import path from "pathe";

import type { ParamsOmitReli } from "~/libs/sdk/types/types-mod.js";

/**
 * Sets up the dev environment if the isDev flag is true.
 */
export async function setupDevModeIfNeeded(
  params: ParamsOmitReli,
): Promise<void> {
  if (params.isDev) {
    const newCwd = path.join(params.cwd, "tests-runtime");
    await ensuredir(newCwd);
    params.cwd = newCwd;
    relinka("info-verbose", `Dev mode: using tests-runtime => ${newCwd}`);
  }
}
