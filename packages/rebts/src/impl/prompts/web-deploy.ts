// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/prompts/web-deploy.ts

import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import type { Backend, Frontend, Runtime, WebDeploy } from "../types";
import { WEB_FRAMEWORKS } from "../utils/compatibility";
import { exitCancelled } from "../utils/errors";

function hasWebFrontend(frontends: Frontend[]) {
  return frontends.some((f) => WEB_FRAMEWORKS.includes(f));
}

type DeploymentOption = {
  value: WebDeploy;
  label: string;
  hint: string;
};

function getDeploymentDisplay(deployment: WebDeploy): {
  label: string;
  hint: string;
} {
  if (deployment === "wrangler") {
    return {
      label: "Wrangler",
      hint: "Deploy to Cloudflare Workers using Wrangler",
    };
  }
  if (deployment === "alchemy") {
    return {
      label: "Alchemy",
      hint: "Deploy to Cloudflare Workers using Alchemy",
    };
  }
  return {
    label: deployment,
    hint: `Add ${deployment} deployment`,
  };
}

export async function getDeploymentChoice(
  deployment?: WebDeploy,
  _runtime?: Runtime,
  _backend?: Backend,
  frontend: Frontend[] = [],
) {
  if (deployment !== undefined) return deployment;
  if (!hasWebFrontend(frontend)) {
    return "none";
  }

  const availableDeployments = ["wrangler", "alchemy", "none"];

  const options: DeploymentOption[] = availableDeployments.map((deploy) => {
    const { label, hint } = getDeploymentDisplay(deploy as WebDeploy);
    return {
      value: deploy as WebDeploy,
      label,
      hint,
    };
  });

  const response = await selectPrompt<WebDeploy>({
    message: "Select web deployment",
    options,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}

export async function getDeploymentToAdd(
  frontend: Frontend[],
  existingDeployment?: WebDeploy,
) {
  if (!hasWebFrontend(frontend)) {
    return "none";
  }

  const options: DeploymentOption[] = [];

  if (existingDeployment !== "wrangler") {
    const { label, hint } = getDeploymentDisplay("wrangler");
    options.push({
      value: "wrangler",
      label,
      hint,
    });
  }

  if (existingDeployment !== "alchemy") {
    const { label, hint } = getDeploymentDisplay("alchemy");
    options.push({
      value: "alchemy",
      label,
      hint,
    });
  }

  if (existingDeployment && existingDeployment !== "none") {
    return "none";
  }

  if (options.length > 0) {
    options.push({
      value: "none",
      label: "None",
      hint: "Skip deployment setup",
    });
  }

  if (options.length === 0) {
    return "none";
  }

  const response = await selectPrompt<WebDeploy>({
    message: "Select web deployment",
    options,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");

  return response;
}
