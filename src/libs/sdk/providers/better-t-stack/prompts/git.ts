import { re } from "@reliverse/relico";
import { cancel, confirm, isCancel } from "@reliverse/rempts";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getGitChoice(git?: boolean): Promise<boolean> {
  if (git !== undefined) return git;

  const response = await confirm({
    message: "Initialize git repository?",
    initialValue: DEFAULT_CONFIG.git,
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
