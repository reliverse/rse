// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import fs from "@reliverse/dler-fs-utils";
import path from "@reliverse/dler-pathkit";
import { PKG_ROOT } from "../constants";

export const getLatestCLIVersion = () => {
  const packageJsonPath = path.join(PKG_ROOT, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as {
    version?: string;
    [key: string]: unknown;
  };

  return packageJsonContent.version ?? "1.0.0";
};
