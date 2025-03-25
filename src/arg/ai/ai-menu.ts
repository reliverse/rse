import { inputPrompt, selectPrompt } from "@reliverse/prompts";

import type { ReliverseMemory } from "~/utils/schemaMemory.js";

import { experimental } from "~/utils/badgeNotifiers.js";

import { agentRelinter } from "./agents/relinter.js";
import { aiChat } from "./ai-chat.js";
import { ensureOpenAIKey } from "./ai-key.js";

export async function aiMenu(isKeyEnsured: boolean, memory?: ReliverseMemory) {
  if (!isKeyEnsured && memory === undefined) {
    throw new Error("Memory is undefined");
  }
  if (!isKeyEnsured && memory !== undefined) {
    await ensureOpenAIKey(memory);
  }

  const choice = await selectPrompt({
    title: "Reliverse AI",
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
    await aiChat();
  } else if (choice === "relinter") {
    const targetPath = await inputPrompt({
      title: "Relinter",
      content: "Enter the path to the file or directory to lint:",
    });
    await agentRelinter(targetPath);
  }
}
