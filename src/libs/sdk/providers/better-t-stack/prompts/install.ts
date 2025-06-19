import { re } from "@reliverse/relico";
import { cancel, confirm, isCancel } from "@reliverse/rempts";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getinstallChoice(install?: boolean): Promise<boolean> {
  if (install !== undefined) return install;

  const response = await confirm({
    message: "Install dependencies?",
    initialValue: DEFAULT_CONFIG.install,
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
