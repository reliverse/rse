// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/git.ts

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
