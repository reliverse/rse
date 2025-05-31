import { cancel, isCancel, select } from "@clack/prompts";
import pc from "picocolors";

import type { ProjectBackend } from "~/libs/sdk/providers/better-t-stack/types";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";

export async function getBackendFrameworkChoice(
  backendFramework?: ProjectBackend,
): Promise<ProjectBackend> {
  if (backendFramework !== undefined) return backendFramework;

  const response = await select<ProjectBackend>({
    message: "Select backend framework",
    options: [
      {
        value: "hono",
        label: "Hono",
        hint: "Lightweight, ultrafast web framework",
      },
      {
        value: "next",
        label: "Next.js",
        hint: "Full-stack framework with API routes",
      },
      {
        value: "express",
        label: "Express",
        hint: "Fast, unopinionated, minimalist web framework for Node.js",
      },
      {
        value: "elysia",
        label: "Elysia",
        hint: "Ergonomic web framework for building backend servers",
      },
      {
        value: "convex",
        label: "Convex",
        hint: "Reactive backend-as-a-service platform",
      },
    ],
    initialValue: DEFAULT_CONFIG.backend,
  });

  if (isCancel(response)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  return response;
}
