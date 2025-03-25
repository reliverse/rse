import type { CoreMessage } from "ai";

import { inputPrompt } from "@reliverse/prompts";
import { printLineBar } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import { streamText } from "ai";

import { agentRelinter } from "./agents/relinter.js";
import { EXIT_KEYWORDS, MODEL } from "./ai-const.js";

type ParsedUserInput = {
  hasRelinter: boolean;
  path1?: string;
  path2?: string;
  task: string;
};

const messages: CoreMessage[] = [];

/**
 * Initiates a loop to capture user input and provide AI responses.
 */
export async function aiChat(): Promise<void> {
  while (true) {
    const userInput = await getUserInput();
    const parsedInput = parseUserInput(userInput);

    if (parsedInput.hasRelinter) {
      await handleRelinterFlow(parsedInput);
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
 * Analyzes the user input for specific tokens and paths.
 */
function parseUserInput(userInput: string): ParsedUserInput {
  const splitInput = userInput.split(/\s+/);
  let hasRelinter = false;
  let path1: string | undefined;
  let path2: string | undefined;
  const taskParts: string[] = [];

  let i = 0;
  while (i < splitInput.length) {
    const token = splitInput[i]!;

    if (token.toLowerCase() === "@relinter") {
      hasRelinter = true;
      i++;
      continue;
    }

    if (token.toLowerCase() === "@path1") {
      i++;
      path1 = splitInput[i];
      i++;
      continue;
    }

    if (token.toLowerCase() === "@path2") {
      i++;
      path2 = splitInput[i];
      i++;
      continue;
    }

    taskParts.push(token);
    i++;
  }

  if (hasRelinter && !path1 && taskParts.length > 0) {
    const possiblePath = taskParts[taskParts.length - 1]!;
    if (/[\\/]/.exec(possiblePath) || /\.(jsx?|tsx?)$/i.exec(possiblePath)) {
      path1 = possiblePath;
      taskParts.pop();
    }
  }

  return {
    hasRelinter,
    path1,
    path2,
    task: taskParts.join(" ").trim(),
  };
}

/**
 * Directs the flow if '@relinter' is detected, calling the relinter agent as needed.
 */
async function handleRelinterFlow(parsedInput: ParsedUserInput): Promise<void> {
  const { hasRelinter, path1, path2, task } = parsedInput;
  if (hasRelinter && (path1 || path2)) {
    const finalPath = path1 ?? path2;
    if (!finalPath) {
      console.log(
        "No valid path was found after @relinter. Skipping relinter flow.",
      );
    } else {
      await agentRelinter(finalPath, task);
    }
    return;
  }

  if (hasRelinter && !path1 && !path2) {
    await agentRelinter(".", task);
  }
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
