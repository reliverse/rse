import type { ProjectPackageManager } from "~/cli/providers/better-t-stack/types";

export const getUserPkgManager: () => ProjectPackageManager = () => {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent?.startsWith("pnpm")) {
    return "pnpm";
  }
  if (userAgent?.startsWith("bun")) {
    return "bun";
  }
  return "npm";
};
