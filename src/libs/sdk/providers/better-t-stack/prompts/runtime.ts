import { re } from "@reliverse/relico";
import { cancel, isCancel, select } from "@reliverse/rempts";

import type {
  Backend,
  Runtime,
} from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getRuntimeChoice(
  runtime?: Runtime,
  backend?: Backend,
): Promise<Runtime> {
  if (backend === "convex" || backend === "none") {
    return "none";
  }

  if (runtime !== undefined) return runtime;

  if (backend === "next") {
    return "node";
  }

  const runtimeOptions: {
    value: Runtime;
    label: string;
    hint: string;
  }[] = [
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
      label: "Cloudflare Workers (beta)",
      hint: "Edge runtime on Cloudflare's global network",
    });
  }

  const response = await select<Runtime>({
    message: "Select runtime",
    options: runtimeOptions,
    initialValue: DEFAULT_CONFIG.runtime,
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
