// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

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
