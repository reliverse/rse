// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/get-package-manager.ts

import type { PackageManager } from "../types";

export const getUserPkgManager: () => PackageManager = () => {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent?.startsWith("pnpm")) {
    return "pnpm";
  }
  if (userAgent?.startsWith("bun")) {
    return "bun";
  }
  return "npm";
};
