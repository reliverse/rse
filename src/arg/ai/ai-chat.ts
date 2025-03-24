import type { CoreMessage } from "ai";

import { openai } from "@ai-sdk/openai";
import { inputPrompt } from "@reliverse/prompts";
import { printLineBar } from "@reliverse/prompts";
import { re } from "@reliverse/relico";
import { streamText } from "ai";

const messages: CoreMessage[] = [];

export async function aiChat() {
  while (true) {
    //
    // 1) USER PROMPT
    //
    const userInput = (
      await inputPrompt({ title: "You:", symbol: "info" })
    ).trim();
    // Save user message
    messages.push({ role: "user", content: userInput });

    //
    // 2) ASSISTANT RESPONSE
    //
    console.log(`${re.dim("ℹ")}  ${re.bold("Reliverse:")}`);

    // Stream the assistant response
    try {
      const result = streamText({
        model: openai("gpt-3.5-turbo"),
        messages,
        system:
          "You are a professional software developer. Your name is Reliverse.",
      });

      let assistantResponse = "";
      process.stdout.write(re.dim("│  ")); // Initial bar with indent

      for await (const delta of result.textStream) {
        // Handle newlines by adding the bar prefix
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

      console.log(); // New line after response is complete
      printLineBar(""); // Blank bar line after response

      // Save assistant message
      messages.push({ role: "assistant", content: assistantResponse });
    } catch (error) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error),
      );
      printLineBar("Failed to get response from OpenAI. Please try again.");
    }

    if (
      userInput.toLowerCase() === "exit" ||
      userInput.toLowerCase() === "quit" ||
      userInput.toLowerCase() === "bye" ||
      userInput.toLowerCase() === "goodbye" ||
      userInput.toLowerCase() === "thanks! bye!"
    ) {
      break;
    }
  }
}
