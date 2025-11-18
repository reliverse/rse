// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/helpers/deployment/workers/workers-next-setup.ts

import fs from "@reliverse/dler-fs-utils";
import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import type { PackageManager } from "../../../types";
import { addPackageDependency } from "../../../utils/add-package-deps";

export async function setupNextWorkersDeploy(
  projectDir: string,
  _packageManager: PackageManager,
) {
  const webAppDir = path.join(projectDir, "apps/web");
  if (!(await fs.pathExists(webAppDir))) return;

  await addPackageDependency({
    dependencies: ["@opennextjs/cloudflare"],
    devDependencies: ["wrangler"],
    projectDir: webAppDir,
  });

  const packageJsonPath = path.join(webAppDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const pkg = await readPackageJSON(path.dirname(packageJsonPath));

    pkg.scripts = {
      ...pkg.scripts,
      preview: "opennextjs-cloudflare build && opennextjs-cloudflare preview",
      deploy: "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
      upload: "opennextjs-cloudflare build && opennextjs-cloudflare upload",
      "cf-typegen":
        "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
    };

    await writePackageJSON(path.dirname(packageJsonPath), pkg);
  }
}
