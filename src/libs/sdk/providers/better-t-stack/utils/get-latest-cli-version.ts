import fs from "@reliverse/relifso";
import path from "node:path";

import { PKG_ROOT } from "~/libs/sdk/providers/better-t-stack/constants";

interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  packageManager?: string;
  "lint-staged"?: Record<string, string[]>;
}

export const getLatestCLIVersion = () => {
  const packageJsonPath = path.join(PKG_ROOT, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as PackageJson;

  return packageJsonContent.version ?? "1.0.0";
};
