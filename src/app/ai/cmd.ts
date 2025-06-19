import { getRseConfigPath } from "@reliverse/cfg";
import { readRseConfig } from "@reliverse/cfg";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import type { AiSdkAgent } from "~/libs/sdk/ai/ai-impl/ai-types";

import { ensureOpenAIKey } from "~/libs/sdk/ai/ai-impl/ai-auth";
import { AGENT_NAMES } from "~/libs/sdk/ai/ai-impl/ai-const";
import { aiAgenticTool } from "~/libs/sdk/ai/ai-impl/ai-tools";
import { aiMenu } from "~/libs/sdk/ai/ai-menu";
import { getOrCreateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/libs/sdk/utils/terminalHelpers";

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
    const { configPath } = await getRseConfigPath(cwd, isDev, false);
    const config = await readRseConfig(configPath, isDev);
    if (!config) {
      throw new Error("Failed to read rse config");
    }
    const memory = await getOrCreateReliverseMemory();
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
