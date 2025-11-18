// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/install.ts

import { confirmPrompt, isCancel } from "@reliverse/dler-prompt";
import { exitCancelled } from "../utils/errors";

export async function getinstallChoice(install?: boolean) {
  if (install !== undefined) return install;

  const response = await confirmPrompt({
    message: "Install dependencies?",
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
