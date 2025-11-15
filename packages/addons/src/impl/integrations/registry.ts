// apps/rse/src/cmds/init/integrations/registry.ts

import { logger } from "@reliverse/dler-logger";
import type { Integration } from "../types";
import { NextJsIntegration } from "./nextjs";
import { UltraciteIntegration } from "./ultracite";

const INTEGRATIONS: Record<string, () => Integration> = {
  ultracite: () => new UltraciteIntegration(),
  nextjs: () => new NextJsIntegration(),
};

export function getIntegration(name: string): Integration | null {
  const integrationFactory = INTEGRATIONS[name.toLowerCase()];

  if (!integrationFactory) {
    logger.error(`❌ Unknown integration: ${name}`);
    logger.info(`Available integrations: ${listIntegrations().join(", ")}`);
    return null;
  }

  return integrationFactory();
}

export function listIntegrations(): string[] {
  return Object.keys(INTEGRATIONS);
}

export function validateIntegrationNames(names: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const name of names) {
    if (INTEGRATIONS[name.toLowerCase()]) {
      valid.push(name);
    } else {
      invalid.push(name);
    }
  }

  return { valid, invalid };
}
