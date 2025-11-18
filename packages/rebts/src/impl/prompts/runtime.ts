// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/runtime.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Backend, Runtime } from "../types";
import { exitCancelled } from "../utils/errors";

export async function getRuntimeChoice(runtime?: Runtime, backend?: Backend) {
  if (backend === "convex" || backend === "none" || backend === "self") {
    return "none";
  }

  if (runtime !== undefined) return runtime;

  const runtimeOptions: Array<{
    value: Runtime;
    label: string;
    hint: string;
  }> = [
    {
      value: "bun",
      label: "Bun",
      hint: "Fast all-in-one JavaScript runtime",
    },
    {
      value: "node",
      label: "Node.js",
      hint: "Traditional Node.js runtime",
    },
  ];

  if (backend === "hono") {
    runtimeOptions.push({
      value: "workers",
      label: "Cloudflare Workers",
      hint: "Edge runtime on Cloudflare's global network",
    });
  }

  const response = await selectPrompt<Runtime>({
    message: "Select runtime",
    options: runtimeOptions,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
