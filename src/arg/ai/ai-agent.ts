import { inputPrompt } from "@reliverse/prompts";

import { agentRelinter } from "./agents/relinter.js";
import { AGENT_NAMES } from "./ai-const.js";
import { ensureOpenAIKey } from "./ai-key.js";
import { type AIAgentOptions } from "./ai-types.js";

/**
 * Invokes a specific agent based on provided options.
 */
export async function aiAgent({
  agent,
  isKeyEnsured,
  memory,
  target,
}: AIAgentOptions): Promise<void> {
  if (!AGENT_NAMES.includes(agent)) {
    throw new Error("Invalid agent specified.");
  }
  if (!isKeyEnsured && memory === undefined) {
    throw new Error("Memory is undefined");
  }
  if (!isKeyEnsured && memory !== undefined) {
    await ensureOpenAIKey(memory);
  }

  if (agent === "relinter") {
    let targetPath = target;
    if (!targetPath) {
      targetPath = await inputPrompt({
        title: "Relinter",
        content: "Enter the path to the file or directory to lint:",
      });
    }
    await agentRelinter(targetPath);
  }
}
