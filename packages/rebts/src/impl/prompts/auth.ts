// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Auth, Backend } from "../types";
import { exitCancelled } from "../utils/errors";

export async function getAuthChoice(
  auth: Auth | undefined,
  backend?: Backend,
  frontend?: string[],
) {
  if (auth !== undefined) return auth;
  if (backend === "none") {
    return "none" as Auth;
  }
  if (backend === "convex") {
    const supportedBetterAuthFrontends = frontend?.some((f) =>
      [
        "tanstack-router",
        "tanstack-start",
        "next",
        "native-bare",
        "native-uniwind",
        "native-unistyles",
      ].includes(f),
    );

    const hasClerkCompatibleFrontends = frontend?.some((f) =>
      [
        "react-router",
        "tanstack-router",
        "tanstack-start",
        "next",
        "native-bare",
        "native-uniwind",
        "native-unistyles",
      ].includes(f),
    );

    const options = [];

    if (supportedBetterAuthFrontends) {
      options.push({
        value: "better-auth",
        label: "Better-Auth",
        hint: "comprehensive auth framework for TypeScript",
      });
    }

    if (hasClerkCompatibleFrontends) {
      options.push({
        value: "clerk",
        label: "Clerk",
        hint: "More than auth, Complete User Management",
      });
    }

    options.push({ value: "none", label: "None", hint: "No auth" });

    const response = await selectPrompt({
      message: "Select authentication provider",
      options,
    });
    if (isCancel(response)) return exitCancelled("Operation cancelled");
    return response as Auth;
  }

  const response = await selectPrompt({
    message: "Select authentication provider",
    options: [
      {
        value: "better-auth",
        label: "Better-Auth",
        hint: "comprehensive auth framework for TypeScript",
      },
      { value: "none", label: "None" },
    ],
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response as Auth;
}
