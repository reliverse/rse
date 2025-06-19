import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";
import { spinner } from "@reliverse/rempts";
import { execa } from "execa";
import path from "node:path";

import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

import { getPackageExecutionCommand } from "~/libs/sdk/providers/better-t-stack/utils/get-package-execution-command";

export async function setupStarlight(config: ProjectConfig): Promise<void> {
  const { packageManager, projectDir } = config;
  const s = spinner();

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

    await execa(starlightInitCommand, {
      cwd: path.join(projectDir, "apps"),
      env: {
        CI: "true",
      },
      shell: true,
    });

    s.stop("Starlight docs setup successfully!");
  } catch (error) {
    s.stop(re.red("Failed to set up Starlight docs"));
    if (error instanceof Error) {
      relinka("error", error.message);
    }
  }
}
