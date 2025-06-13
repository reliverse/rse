import type { RseConfig } from "@reliverse/cfg";

import { inputPrompt, selectPrompt } from "@reliverse/rempts";

import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory";

import { experimental } from "~/libs/sdk/utils/badgeNotifiers";

import { ensureOpenAIKey } from "./ai-impl/ai-auth";
import { aiChat } from "./ai-impl/ai-chat";
import { agentRelinter } from "./ai-impl/relinter/relinter";

const RANDOM_HINTS = [
  "You can always exit by typing thing like 'bye', 'exit', or just by pressing Ctrl+C.",
  "While chatting, use @relinter with paths to lint specific files or directories.",
];

export async function aiMenu(
  config: RseConfig,
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
    title: "rse AI",
    content: `Random hint: ${RANDOM_HINTS[Math.floor(Math.random() * RANDOM_HINTS.length)]}`,
    options: [
      { label: "Talk to rse", value: "chat" },
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
