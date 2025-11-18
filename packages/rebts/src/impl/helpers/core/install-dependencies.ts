// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import { createSpinner } from "@reliverse/dler-spinner";
import { $ } from "execa";
import type { Addons, PackageManager } from "../../types";

export async function installDependencies({
  projectDir,
  packageManager,
}: {
  projectDir: string;
  packageManager: PackageManager;
  addons?: Addons[];
}) {
  const s = createSpinner();

  try {
    s.start(`Running ${packageManager} install...`);

    await $({
      cwd: projectDir,
      stderr: "inherit",
    })`${packageManager} install`;

    s.stop("Dependencies installed successfully");
  } catch (error) {
    s.stop(re.red("Failed to install dependencies"));
    if (error instanceof Error) {
      logger.error(re.red(`Installation error: ${error.message}`));
    }
  }
}
