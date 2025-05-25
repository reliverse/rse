import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import type { AiSdkAgent } from "~/libs/sdk/ai/ai-impl/ai-types.js";

import { ensureOpenAIKey } from "~/libs/sdk/ai/ai-impl/ai-auth.js";
import { AGENT_NAMES } from "~/libs/sdk/ai/ai-impl/ai-const.js";
import { aiAgenticTool } from "~/libs/sdk/ai/ai-impl/ai-tools.js";
import { aiMenu } from "~/libs/sdk/ai/ai-menu.js";
import { readRseConfig } from "~/libs/sdk/utils/rseConfig/rc-read.js";
import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers.js";

export default defineCommand({
  meta: {
    name: "ai",
    description: "Chat with rse use rse Agent",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run the CLI in dev mode",
    },
    generate: {
      type: "string",
      description: "Generate a new project",
    },
    agent: {
      type: "string",
      description: "Select a rse",
    },
    target: {
      type: "string",
      description: "Path to the file or directory (skips Relinter's prompt)",
    },
  },
  run: async ({ args }) => {
    const isDev = args.dev;
    if (isDev) {
      relinka("verbose", "Using dev mode");
    }

    const cwd = getCurrentWorkingDirectory();
    const config = await readRseConfig(cwd, isDev);
    if (!config) {
      throw new Error("Failed to read rse config");
    }
    const memory = await getReliverseMemory();
    await ensureOpenAIKey(memory);

    const agent = args.agent as AiSdkAgent | undefined;
    if (agent !== undefined) {
      if (!AGENT_NAMES.includes(agent)) {
        throw new Error(
          `Invalid agent specified. Valid agents: ${AGENT_NAMES.join(", ")}`,
        );
      }
      await aiAgenticTool({
        config,
        agent,
        isKeyEnsured: true,
        target: args.target,
      });
      process.exit(0);
    }

    await aiMenu(config, true);

    process.exit(0);
  },
});
