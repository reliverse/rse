// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import fs from "@reliverse/dler-fs-utils";
import path from "@reliverse/dler-pathkit";
import type { ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";

export async function setupPayments(config: ProjectConfig) {
  const { payments, projectDir, frontend } = config;

  if (!payments || payments === "none") {
    return;
  }

  const clientDir = path.join(projectDir, "apps/web");
  const authDir = path.join(projectDir, "packages/auth");

  const clientDirExists = await fs.pathExists(clientDir);
  const authDirExists = await fs.pathExists(authDir);

  if (payments === "polar") {
    if (authDirExists) {
      await addPackageDependency({
        dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
        projectDir: authDir,
      });
    }

    if (clientDirExists) {
      const hasWebFrontend = frontend.some((f) =>
        [
          "react-router",
          "tanstack-router",
          "tanstack-start",
          "next",
          "nuxt",
          "svelte",
          "solid",
        ].includes(f),
      );

      if (hasWebFrontend) {
        await addPackageDependency({
          dependencies: ["@polar-sh/better-auth"],
          projectDir: clientDir,
        });
      }
    }
  }
}
