import type { RseConfig } from "~/libs/sdk/utils/rseConfig/cfg-types.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import type { AGENT_NAMES, CIRCULAR_TRIGGERS } from "./ai-const.js";

export type CircularTrigger = (typeof CIRCULAR_TRIGGERS)[number];

export type AiSdkAgent = (typeof AGENT_NAMES)[number];

export type AIAgentOptions = {
  config: RseConfig;
  agent: AiSdkAgent;
  isKeyEnsured: boolean;
  memory?: ReliverseMemory;
  target?: string;
};
