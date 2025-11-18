// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { re } from "@reliverse/dler-colors";
import fs from "@reliverse/dler-fs-utils";
import { logger } from "@reliverse/dler-logger";
import path from "@reliverse/dler-pathkit";
import { createSpinner } from "@reliverse/dler-spinner";
import { execa } from "execa";
import type { ProjectConfig } from "../../types";
import { getPackageExecutionCommand } from "../../utils/package-runner";

export async function setupStarlight(config: ProjectConfig) {
  const { packageManager, projectDir } = config;
  const s = createSpinner();

  try {
    s.start("Setting up Starlight docs...");

    const starlightArgs = [
      "docs",
      "--template",
      "starlight",
      "--no-install",
      "--add",
      "tailwind",
      "--no-git",
      "--skip-houston",
    ];
    const starlightArgsString = starlightArgs.join(" ");

    const commandWithArgs = `create-astro@latest ${starlightArgsString}`;

    const starlightInitCommand = getPackageExecutionCommand(
      packageManager,
      commandWithArgs,
    );

    const appsDir = path.join(projectDir, "apps");
    await fs.ensureDir(appsDir);

    await execa(starlightInitCommand, {
      cwd: appsDir,
      env: {
        CI: "true",
      },
      shell: true,
    });

    s.stop("Starlight docs setup successfully!");
  } catch (error) {
    s.stop(re.red("Failed to set up Starlight docs"));
    if (error instanceof Error) {
      logger.error(re.red(error.message));
    }
  }
}
