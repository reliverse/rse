// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { confirmPrompt, isCancel } from "@reliverse/dler-prompt";
import { exitCancelled } from "../utils/errors";

export async function getGitChoice(git?: boolean) {
  if (git !== undefined) return git;

  const response = await confirmPrompt({
    message: "Initialize git repository?",
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
