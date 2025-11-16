import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import { createSpinner } from "@reliverse/dler-spinner";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
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
