import { inputPrompt, relinka } from "@reliverse/prompts";
import dotenv from "dotenv";
import { ofetch } from "ofetch";

import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { updateReliverseMemory } from "~/libs/sdk/utils/reliverseMemory.js";

dotenv.config();

/**
 * Ensures we have a valid OpenAI API key in either:
 *  1) process.env
 *  2) memory.openaiKey
 *
 * If not found or invalid, prompts the user to provide one,
 * then stores it in memory.
 */
export async function ensureOpenAIKey(
  memory: ReliverseMemory,
): Promise<string> {
  let envKeyInvalid = false;
  let memoryKeyInvalid = false;

  // 1) Check .env
  if (process.env.OPENAI_API_KEY) {
    try {
      await ofetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });
      return process.env.OPENAI_API_KEY;
    } catch {
      envKeyInvalid = true;
      relinka(
        "warn",
        "OpenAI key in .env file is invalid, let me check my memory...",
      );
    }
  }

  // 2) Check memory
  if (memory.openaiKey) {
    try {
      await ofetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${memory.openaiKey}` },
      });
      // If valid, update .env if needed.
      process.env.OPENAI_API_KEY = memory.openaiKey;
      if (envKeyInvalid) {
        relinka(
          "info",
          "Found valid key in memory, using it instead of invalid .env key",
        );
      }
      return memory.openaiKey;
    } catch {
      memoryKeyInvalid = true;
      relinka("warn", "OpenAI key in memory is invalid");
    }
  }

  // 3) Prompt for a new one.
  if (envKeyInvalid || memoryKeyInvalid) {
    relinka(
      "info",
      "Please provide a new OpenAI API key as existing ones are invalid",
    );
  }

  const token = await inputPrompt({
    title:
      "Please enter your OpenAI API key.\n(It will be securely stored on your machine):",
    content: "Get one at https://platform.openai.com/api-keys",
    validate: async (value: string): Promise<string | boolean> => {
      if (!value?.trim()) {
        return "API key is required";
      }
      try {
        await ofetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${value}` },
        });
        return true;
      } catch {
        return "Invalid API key. Please check your key and try again.";
      }
    },
  });

  // Store the new token in both memory and process.env
  await updateReliverseMemory({ openaiKey: token });
  process.env.OPENAI_API_KEY = token;
  return token;
}
