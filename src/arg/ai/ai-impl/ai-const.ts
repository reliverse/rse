import type { LanguageModel } from "ai";

import { openai } from "@ai-sdk/openai";

export const AGENT_NAMES = ["relinter"] as const;

export const MODEL: LanguageModel = openai("gpt-4o-mini");

export const MODEL_NAME = MODEL.modelId;

export const MAX_TOKENS = 1000;

export const CIRCULAR_TRIGGERS = [
  "detect circular dependencies",
  "verify circular dependencies",
  "check circular dependencies",
  "detect circular deps",
  "verify circular deps",
  "check circular deps",
];

export const EXIT_KEYWORDS = [
  "thanks! bye!",
  "goodbye",
  "quit",
  "exit",
  "bye",
  "gg",
];
