// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import { $ } from "execa";

export async function initializeGit(projectDir: string, useGit: boolean) {
  if (!useGit) return;

  const gitVersionResult = await $({
    cwd: projectDir,
    reject: false,
    stderr: "pipe",
  })`git --version`;

  if (gitVersionResult.exitCode !== 0) {
    logger.warn(re.yellow("Git is not installed"));
    return;
  }

  const result = await $({
    cwd: projectDir,
    reject: false,
    stderr: "pipe",
  })`git init`;

  if (result.exitCode !== 0) {
    throw new Error(`Git initialization failed: ${result.stderr}`);
  }

  await $({ cwd: projectDir })`git add -A`;
  await $({ cwd: projectDir })`git commit -m ${"initial commit"}`;
}
