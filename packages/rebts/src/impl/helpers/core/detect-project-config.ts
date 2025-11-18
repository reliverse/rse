// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import fs from "@reliverse/dler-fs-utils";
import path from "@reliverse/dler-pathkit";
import { readBtsConfig } from "../../utils/bts-config";

export async function detectProjectConfig(projectDir: string) {
  try {
    const btsConfig = await readBtsConfig(projectDir);
    if (btsConfig) {
      return {
        projectDir,
        projectName: path.basename(projectDir),
        database: btsConfig.database,
        orm: btsConfig.orm,
        backend: btsConfig.backend,
        runtime: btsConfig.runtime,
        frontend: btsConfig.frontend,
        addons: btsConfig.addons,
        examples: btsConfig.examples,
        auth: btsConfig.auth,
        payments: btsConfig.payments,
        packageManager: btsConfig.packageManager,
        dbSetup: btsConfig.dbSetup,
        api: btsConfig.api,
        webDeploy: btsConfig.webDeploy,
        serverDeploy: btsConfig.serverDeploy,
      };
    }

    return null;
  } catch (_error) {
    return null;
  }
}

export async function isBetterTStackProject(projectDir: string) {
  try {
    return await fs.pathExists(path.join(projectDir, "bts.jsonc"));
  } catch (_error) {
    return false;
  }
}
