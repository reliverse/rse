import { inputPrompt } from "@reliverse/rempts";

import type { AIAgentOptions } from "./ai-types";

import { ensureOpenAIKey } from "./ai-auth";
import { AGENT_NAMES } from "./ai-const";
import { agentRelinter } from "./relinter/relinter";

/**
 * Invokes a specific agent based on provided options.
 */
export async function aiAgenticTool({
  config,
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

    // Convert the string to a string[] and handle multiple paths
    const userPaths = targetPath.split(/\s+/).filter(Boolean);

    await agentRelinter(config, userPaths);
  }
}
