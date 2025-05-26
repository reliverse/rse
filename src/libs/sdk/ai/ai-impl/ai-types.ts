import type { RseConfig } from "~/libs/sdk/utils/rseConfig/cfg-types";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import type { AGENT_NAMES, CIRCULAR_TRIGGERS } from "./ai-const";

export type CircularTrigger = (typeof CIRCULAR_TRIGGERS)[number];

export type AiSdkAgent = (typeof AGENT_NAMES)[number];

export interface AIAgentOptions {
  config: RseConfig;
  agent: AiSdkAgent;
  isKeyEnsured: boolean;
  memory?: ReliverseMemory;
  target?: string;
}
