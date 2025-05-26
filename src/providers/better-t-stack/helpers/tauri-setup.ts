import { spinner } from "@clack/prompts";
import fs from "@reliverse/relifso";
import { consola } from "consola";
import { execa } from "execa";
import path from "node:path";
import pc from "picocolors";

import type { ProjectConfig } from "~/providers/better-t-stack/types";

import { addPackageDependency } from "~/providers/better-t-stack/utils/add-package-deps";
import { getPackageExecutionCommand } from "~/providers/better-t-stack/utils/get-package-execution-command";

export async function setupTauri(config: ProjectConfig): Promise<void> {
  const { projectName, packageManager, frontend } = config;
  const projectDir = path.resolve(process.cwd(), projectName);
  const s = spinner();
  const clientPackageDir = path.join(projectDir, "apps/web");

  if (!(await fs.pathExists(clientPackageDir))) {
    return;
  }

  try {
    s.start("Setting up Tauri desktop app support...");

    await addPackageDependency({
      devDependencies: ["@tauri-apps/cli"],
      projectDir: clientPackageDir,
    });

    const clientPackageJsonPath = path.join(clientPackageDir, "package.json");
    if (await fs.pathExists(clientPackageJsonPath)) {
      const packageJson = (await fs.readJson(clientPackageJsonPath)) as {
        scripts?: Record<string, string>;
      };

      packageJson.scripts = {
        ...packageJson.scripts,
        tauri: "tauri",
        "desktop:dev": "tauri dev",
        "desktop:build": "tauri build",
      };

      await fs.writeJson(clientPackageJsonPath, packageJson, { spaces: 2 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasTanstackRouter = frontend.includes("tanstack-router");
    const hasReactRouter = frontend.includes("react-router");
    const hasNuxt = frontend.includes("nuxt");
    const hasSvelte = frontend.includes("svelte");

    const devUrl = hasReactRouter
      ? "http://localhost:5173"
      : hasSvelte
        ? "http://localhost:5173"
        : "http://localhost:3001";

    const frontendDist = hasNuxt
      ? "../.output/public"
      : hasSvelte
        ? "../build"
        : "../dist";

    const tauriArgs = [
      "init",
      `--app-name=${path.basename(projectDir)}`,
      `--window-title=${path.basename(projectDir)}`,
      `--frontend-dist=${frontendDist}`,
      `--dev-url=${devUrl}`,
      // eslint-disable-next-line no-useless-escape
      `--before-dev-command=\"${packageManager} run dev\"`,
      // eslint-disable-next-line no-useless-escape
      `--before-build-command=\"${packageManager} run build\"`,
    ];
    const tauriArgsString = tauriArgs.join(" ");

    const commandWithArgs = `@tauri-apps/cli@latest ${tauriArgsString}`;

    const tauriInitCommand = getPackageExecutionCommand(
      packageManager,
      commandWithArgs,
    );

    await execa(tauriInitCommand, {
      cwd: clientPackageDir,
      env: {
        CI: "true",
      },
      shell: true,
    });

    s.stop("Tauri desktop app support configured successfully!");
  } catch (error) {
    s.stop(pc.red("Failed to set up Tauri"));
    if (error instanceof Error) {
      consola.error(pc.red(error.message));
    }
  }
}
