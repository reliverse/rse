import fs from "@reliverse/relifso";
import path from "node:path";

import { PKG_ROOT } from "~/libs/sdk/providers/better-t-stack/constants";

export const getLatestCLIVersion = () => {
  const packageJsonPath = path.join(PKG_ROOT, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as {
    version: string;
  };

  return packageJsonContent.version ?? "1.0.0";
};
