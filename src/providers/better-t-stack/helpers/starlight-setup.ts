import { spinner } from "@clack/prompts";
import consola from "consola";
import { execa } from "execa";
import path from "node:path";
import pc from "picocolors";

import type { ProjectConfig } from "~/providers/better-t-stack/types";

import { getPackageExecutionCommand } from "~/providers/better-t-stack/utils/get-package-execution-command";

export async function setupStarlight(config: ProjectConfig): Promise<void> {
  const { projectName, packageManager } = config;
  const projectDir = path.resolve(process.cwd(), projectName);
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
    s.stop(pc.red("Failed to set up Starlight docs"));
    if (error instanceof Error) {
      consola.error(pc.red(error.message));
    }
  }
}
