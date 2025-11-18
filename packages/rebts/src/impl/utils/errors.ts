import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import { PromptCancelledError } from "@reliverse/dler-prompt";

// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/errors.ts

function isProgrammatic() {
  return process.env.BTS_PROGRAMMATIC === "1";
}

export function exitWithError(message: string): never {
  logger.error(re.red(message));
  if (isProgrammatic()) {
    throw new Error(message);
  }
  process.exit(1);
}

export function exitCancelled(message = "Operation cancelled"): never {
  if (isProgrammatic()) {
    throw new PromptCancelledError(message);
  }

  console.log(re.red(message));
  process.exit(0);
}

export function handleError(error: unknown, fallbackMessage?: string): never {
  const message =
    error instanceof Error ? error.message : fallbackMessage || String(error);
  logger.error(re.red(message));
  if (isProgrammatic()) {
    throw new Error(message);
  }
  process.exit(1);
}
