import path from "@reliverse/pathkit";
import { ensuredir } from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";

import type { ParamsOmitReli } from "~/libs/sdk/sdk-types";

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
    relinka("verbose", `Dev mode: using tests-runtime => ${newCwd}`);
  }
}
