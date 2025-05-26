import fs from "@reliverse/relifso";
import path from "node:path";

import type { AvailableDependencies } from "~/providers/better-t-stack/constants";
import type { ProjectConfig } from "~/providers/better-t-stack/types";

import { addPackageDependency } from "~/providers/better-t-stack/utils/add-package-deps";

export async function setupExamples(config: ProjectConfig): Promise<void> {
  const { projectName, examples, frontend, backend } = config;

  if (
    backend === "convex" ||
    !examples ||
    examples.length === 0 ||
    examples[0] === "none"
  ) {
    return;
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  if (examples.includes("ai")) {
    const clientDir = path.join(projectDir, "apps/web");
    const serverDir = path.join(projectDir, "apps/server");
    const clientDirExists = await fs.pathExists(clientDir);
    const serverDirExists = await fs.pathExists(serverDir);

    const hasNuxt = frontend.includes("nuxt");
    const hasSvelte = frontend.includes("svelte");

    if (clientDirExists) {
      const dependencies: AvailableDependencies[] = ["ai"];
      if (hasNuxt) {
        dependencies.push("@ai-sdk/vue");
      } else if (hasSvelte) {
        dependencies.push("@ai-sdk/svelte");
      } else {
        /* empty */
      }
      await addPackageDependency({
        dependencies,
        projectDir: clientDir,
      });
    }

    if (serverDirExists) {
      await addPackageDependency({
        dependencies: ["ai", "@ai-sdk/google"],
        projectDir: serverDir,
      });
    }
  }
}
