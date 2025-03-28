import { inputPrompt, selectPrompt } from "@reliverse/prompts";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { experimental } from "~/libs/sdk/utils/badgeNotifiers.js";

import { ensureOpenAIKey } from "./ai-impl/ai-auth.js";
import { aiChat } from "./ai-impl/ai-chat.js";
import { agentRelinter } from "./ai-impl/relinter/relinter.js";

const RANDOM_HINTS = [
  "You can always exit by typing thing like 'bye', 'exit', or just by pressing Ctrl+C.",
  "While chatting, use @relinter with paths to lint specific files or directories.",
];

export async function aiMenu(
  config: ReliverseConfig,
  isKeyEnsured: boolean,
  memory?: ReliverseMemory,
) {
  if (!isKeyEnsured && memory === undefined) {
    throw new Error("Memory is undefined");
  }
  if (!isKeyEnsured && memory !== undefined) {
    await ensureOpenAIKey(memory);
  }

  const choice = await selectPrompt({
    title: "Reliverse AI",
    content: `Random hint: ${RANDOM_HINTS[Math.floor(Math.random() * RANDOM_HINTS.length)]}`,
    options: [
      { label: "Talk to Reliverse AI", value: "chat" },
      {
        label: "Use Relinter Agent",
        value: "relinter",
        hint: experimental,
      },
      { label: "Exit", value: "exit" },
    ],
  });

  if (choice === "chat") {
    await aiChat(config);
  } else if (choice === "relinter") {
    const targetPath = await inputPrompt({
      title: "Relinter",
      content: "Enter the path to the file or directory to lint:",
    });
    // Convert the string to a string[] and handle multiple paths
    const userPaths = targetPath.split(/\s+/).filter(Boolean);
    await agentRelinter(config, userPaths);
  }
}
