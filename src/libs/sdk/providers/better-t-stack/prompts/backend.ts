import { re } from "@reliverse/relico";
import { cancel, isCancel, select } from "@reliverse/rempts";

import type {
  Backend,
  Frontend,
} from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getBackendFrameworkChoice(
  backendFramework?: Backend,
  frontends?: Frontend[],
): Promise<Backend> {
  if (backendFramework !== undefined) return backendFramework;

  const hasIncompatibleFrontend = frontends?.some(
    (f) => f === "nuxt" || f === "solid",
  );

  const backendOptions: {
    value: Backend;
    label: string;
    hint: string;
  }[] = [
    {
      value: "hono" as const,
      label: "Hono",
      hint: "Lightweight, ultrafast web framework",
    },
    {
      value: "next" as const,
      label: "Next.js",
      hint: "separate api routes only backend",
    },
    {
      value: "express" as const,
      label: "Express",
      hint: "Fast, unopinionated, minimalist web framework for Node.js",
    },
    {
      value: "fastify" as const,
      label: "Fastify",
      hint: "Fast, low-overhead web framework for Node.js",
    },
    {
      value: "elysia" as const,
      label: "Elysia",
      hint: "Ergonomic web framework for building backend servers",
    },
  ];

  if (!hasIncompatibleFrontend) {
    backendOptions.push({
      value: "convex" as const,
      label: "Convex",
      hint: "Reactive backend-as-a-service platform",
    });
  }

  backendOptions.push({
    value: "none" as const,
    label: "None",
    hint: "No backend server",
  });

  let initialValue = DEFAULT_CONFIG.backend;
  if (hasIncompatibleFrontend && initialValue === "convex") {
    initialValue = "hono";
  }

  const response = await select<Backend>({
    message: "Select backend",
    options: backendOptions,
    initialValue,
  });

  if (isCancel(response)) {
    cancel(re.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
