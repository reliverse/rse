import { cancel, isCancel, select } from "@clack/prompts";
import pc from "picocolors";

import type {
  ProjectApi,
  ProjectBackend,
  ProjectFrontend,
} from "~/cli/providers/better-t-stack/types.js";

import { DEFAULT_CONFIG } from "~/cli/providers/better-t-stack/constants.js";

export async function getApiChoice(
  Api?: ProjectApi,
  frontend?: ProjectFrontend[],
  backend?: ProjectBackend,
): Promise<ProjectApi> {
  if (backend === "convex") {
    return "none";
  }

  if (Api) return Api;

  const includesNuxt = frontend?.includes("nuxt");
  const includesSvelte = frontend?.includes("svelte");

  let apiOptions = [
    {
      value: "trpc" as const,
      label: "tRPC",
      hint: "End-to-end typesafe APIs made easy",
    },
    {
      value: "orpc" as const,
      label: "oRPC",
      hint: "End-to-end type-safe APIs that adhere to OpenAPI standards",
    },
  ];

  if (includesNuxt || includesSvelte) {
    apiOptions = [
      {
        value: "orpc" as const,
        label: "oRPC",
        hint: `End-to-end type-safe APIs (Required for ${
          includesNuxt ? "Nuxt" : "Svelte"
        } frontend)`,
      },
    ];
  }

  const apiType = await select<ProjectApi>({
    message: "Select API type",
    options: apiOptions,
    initialValue: includesNuxt || includesSvelte ? "orpc" : DEFAULT_CONFIG.api,
  });

  if (isCancel(apiType)) {
    cancel(pc.red("Operation cancelled"));
    process.exit(0);
  }

  if ((includesNuxt || includesSvelte) && apiType !== "orpc") {
    return "orpc";
  }

  return apiType;
}
