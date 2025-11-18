// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/api.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { API, Backend, Frontend } from "../types";
import { allowedApisForFrontends } from "../utils/compatibility-rules";
import { exitCancelled } from "../utils/errors";

export async function getApiChoice(
  Api?: API | undefined,
  frontend?: Frontend[],
  backend?: Backend,
) {
  if (backend === "convex" || backend === "none") {
    return "none";
  }

  const allowed = allowedApisForFrontends(frontend ?? []);

  if (Api) {
    return allowed.includes(Api) ? Api : allowed[0];
  }
  const apiOptions = allowed.map((a) =>
    a === "trpc"
      ? {
          value: "trpc" as const,
          label: "tRPC",
          hint: "End-to-end typesafe APIs made easy",
        }
      : a === "orpc"
        ? {
            value: "orpc" as const,
            label: "oRPC",
            hint: "End-to-end type-safe APIs that adhere to OpenAPI standards",
          }
        : {
            value: "none" as const,
            label: "None",
            hint: "No API layer (e.g. for full-stack frameworks like Next.js with Route Handlers)",
          },
  );

  const apiType = await selectPrompt<API>({
    message: "Select API type",
    options: apiOptions,
  });

  if (isCancel(apiType)) return exitCancelled("Operation cancelled");

  return apiType;
}
