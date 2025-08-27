import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";
import { ensureOpenAIKey } from "~/app/ai/ai-impl/ai-auth";
import { AGENT_NAMES } from "~/app/ai/ai-impl/ai-const";
import { aiAgenticTool } from "~/app/ai/ai-impl/ai-tools";
import type { AiSdkAgent } from "~/app/ai/ai-impl/ai-types";
import { aiMenu } from "~/app/ai/ai-menu";
import { getReliverseConfigPath } from "~/app/config/path";
import { readReliverseConfig } from "~/app/config/read";
import { getOrCreateReliverseMemory } from "~/app/utils/reliverseMemory";
import { getCurrentWorkingDirectory } from "~/app/utils/terminalHelpers";

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
    const { configPath } = await getReliverseConfigPath(cwd, isDev, false);
    const config = await readReliverseConfig(configPath, isDev);
    if (!config) {
      throw new Error("Failed to read rse config");
    }
    const memory = await getOrCreateReliverseMemory();
    await ensureOpenAIKey(memory);

    const agent = args.agent as AiSdkAgent | undefined;
    if (agent !== undefined) {
      if (!AGENT_NAMES.includes(agent)) {
        throw new Error(`Invalid agent specified. Valid agents: ${AGENT_NAMES.join(", ")}`);
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
