// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/command-exists.ts

import { execa } from "execa";

export async function commandExists(command: string) {
  try {
    const isWindows = process.platform === "win32";
    if (isWindows) {
      const result = await execa("where", [command]);
      return result.exitCode === 0;
    }

    const result = await execa("which", [command]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}
