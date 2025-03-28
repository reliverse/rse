import type { CoreMessage } from "ai";

import { inputPrompt } from "@reliverse/prompts";
import { printLineBar } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import { streamText } from "ai";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import { EXIT_KEYWORDS, MODEL } from "./ai-const.js";
import { agentRelinter } from "./relinter/relinter.js";

/**
 * Represents the structured result of user input parsing.
 */
type ParsedUserInput = {
  hasRelinter: boolean;
  paths: string[];
  task: string;
};

const messages: CoreMessage[] = [];

/**
 * Initiates a loop to capture user input and provide AI responses.
 */
export async function aiChat(config: ReliverseConfig): Promise<void> {
  while (true) {
    const userInput = await getUserInput();
    const parsedInput = parseUserInput(userInput);

    if (parsedInput.hasRelinter) {
      await handleRelinterFlow(config, parsedInput);
    } else {
      await handleNormalChatFlow(userInput);
    }

    if (shouldExit(userInput)) {
      break;
    }
  }
}

/**
 * Retrieves and trims user input.
 */
async function getUserInput(): Promise<string> {
  const input = await inputPrompt({ title: "You:", symbol: "info" });
  return input.trim();
}

/**
 * Analyzes user input for @relinter usage and collects any path-like tokens.
 */
function parseUserInput(userInput: string): ParsedUserInput {
  const tokens = userInput.split(/\s+/);
  let hasRelinter = false;
  const paths: string[] = [];
  const taskParts: string[] = [];

  for (const rawToken of tokens) {
    const token = removeTrailingPunctuation(rawToken);

    if (token.toLowerCase() === "@relinter") {
      hasRelinter = true;
      continue;
    }

    if (looksLikePath(token)) {
      paths.push(token);
      continue;
    }

    taskParts.push(token);
  }

  return {
    hasRelinter,
    paths,
    task: taskParts.join(" ").trim(),
  };
}

/**
 * Removes common trailing punctuation from a token.
 */
function removeTrailingPunctuation(token: string): string {
  return token.replace(/[.,!?;:]+$/, "");
}

/**
 * Determines if a token might represent a file or directory path.
 */
function looksLikePath(token: string): boolean {
  return (
    token.includes("/") || token.includes("\\") || /\.(jsx?|tsx?)$/i.test(token)
  );
}

/**
 * Directs the flow if @relinter is detected, calling the relinter agent with all paths.
 */
async function handleRelinterFlow(
  config: ReliverseConfig,
  parsedInput: ParsedUserInput,
): Promise<void> {
  const { hasRelinter, paths, task } = parsedInput;
  if (!hasRelinter) return;

  const finalPaths = paths.length > 0 ? paths : ["."];
  await agentRelinter(config, finalPaths, task);
}

/**
 * Handles normal conversation flow by sending user input to the AI model.
 */
async function handleNormalChatFlow(userInput: string): Promise<void> {
  messages.push({ role: "user", content: userInput });
  console.log(`${re.dim("ℹ")}  ${re.bold("Reliverse:")}`);

  try {
    const result = streamText({
      model: MODEL,
      messages,
      system:
        "You are a professional software developer. Your name is Reliverse.",
    });

    let assistantResponse = "";
    process.stdout.write(re.dim("│  "));

    for await (const delta of result.textStream) {
      const lines = delta.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          console.log();
          process.stdout.write(re.dim("│  "));
        }
        process.stdout.write(lines[i] ?? "");
      }
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      assistantResponse += delta;
    }

    console.log();
    printLineBar("");

    messages.push({ role: "assistant", content: assistantResponse });
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    printLineBar("Failed to get response from OpenAI. Please try again.");
  }
}

/**
 * Determines if the user requested to exit the chat.
 */
function shouldExit(userInput: string): boolean {
  const lower = userInput.toLowerCase();
  return EXIT_KEYWORDS.some((keyword) => keyword === lower);
}
