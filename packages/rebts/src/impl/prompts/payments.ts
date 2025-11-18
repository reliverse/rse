// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/payments.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Auth, Backend, Frontend, Payments } from "../types";
import { splitFrontends } from "../utils/compatibility-rules";
import { exitCancelled } from "../utils/errors";

export async function getPaymentsChoice(
  payments?: Payments,
  auth?: Auth,
  backend?: Backend,
  frontends?: Frontend[],
) {
  if (payments !== undefined) return payments;

  if (backend === "none") {
    return "none" as Payments;
  }

  const isPolarCompatible =
    auth === "better-auth" &&
    backend !== "convex" &&
    (frontends?.length === 0 || splitFrontends(frontends).web.length > 0);

  if (!isPolarCompatible) {
    return "none" as Payments;
  }

  const options = [
    {
      value: "polar" as Payments,
      label: "Polar",
      hint: "Turn your software into a business. 6 lines of code.",
    },
    {
      value: "none" as Payments,
      label: "None",
      hint: "No payments integration",
    },
  ];

  const response = await selectPrompt<Payments>({
    message: "Select payments provider",
    options,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
