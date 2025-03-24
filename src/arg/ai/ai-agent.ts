import type { ReliverseMemory } from "~/utils/schemaMemory.js";

import { agentRelinter } from "./agents/relinter.js";
import { ensureOpenAIKey } from "./ai-key.js";
import { AGENTS, type Agent } from "./ai-types.js";

export async function aiAgent(
  agent: Agent,
  isKeyEnsured: boolean,
  memory?: ReliverseMemory,
) {
  if (!AGENTS.includes(agent)) {
    throw new Error("Invalid agent specified.");
  }
  if (!isKeyEnsured && memory === undefined) {
    throw new Error("Memory is undefined");
  }
  if (!isKeyEnsured && memory !== undefined) {
    await ensureOpenAIKey(memory);
  }

  // =========================================
  // Reliverse Agents
  // =========================================

  if (agent === "relinter") {
    await agentRelinter();
  }
}
