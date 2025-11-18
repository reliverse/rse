// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import fs from "@reliverse/dler-fs-utils";
import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import type { PackageManager } from "../../../types";
import { addPackageDependency } from "../../../utils/add-package-deps";

export async function setupTanStackRouterAlchemyDeploy(
  projectDir: string,
  _packageManager: PackageManager,
  options?: { skipAppScripts?: boolean },
) {
  const webAppDir = path.join(projectDir, "apps/web");
  if (!(await fs.pathExists(webAppDir))) return;

  await addPackageDependency({
    devDependencies: ["alchemy"],
    projectDir: webAppDir,
  });

  const pkgPath = path.join(webAppDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await readPackageJSON(path.dirname(pkgPath));

    if (!options?.skipAppScripts) {
      pkg.scripts = {
        ...pkg.scripts,
        deploy: "alchemy deploy",
        destroy: "alchemy destroy",
      };
    }

    await writePackageJSON(path.dirname(pkgPath), pkg);
  }
}
