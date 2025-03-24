import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import fs from "fs-extra";
import path from "pathe";

// Defines the structure for a lint suggestion
export type LintSuggestion = {
  filePath: string;
  startLine: number;
  endLine: number;
  suggestion: string;
};

// Coordinates the relinter process
export async function agentRelinter(): Promise<void> {
  try {
    const targetPath = getTargetPathOrExit();
    const absoluteTargetPath = path.resolve(targetPath);
    const lintFiles = await collectLintableFiles(absoluteTargetPath);

    if (lintFiles.length === 0) {
      console.log("No .js/.jsx/.ts/.tsx files found in the specified path.");
      return;
    }

    console.log(
      `Found ${lintFiles.length} file(s). Sending them to GPT-3.5...`,
    );
    const lintResults = await gatherLintSuggestions(lintFiles);
    await writeSuggestionsToFile(lintResults);
    console.log("Lint suggestions written to relinter.json");
  } catch (err: any) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

// Retrieves the target path from the arguments
function getTargetPathOrExit(): string {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Please provide a file or directory path.");
    process.exit(1);
  }
  return inputPath;
}

// Recursively collects all lintable files (.js, .jsx, .ts, .tsx)
export async function collectLintableFiles(
  dirOrFile: string,
): Promise<string[]> {
  const stats = await fs.stat(dirOrFile);
  if (stats.isFile()) {
    return isLintableFile(dirOrFile) ? [dirOrFile] : [];
  }

  const entries = await fs.readdir(dirOrFile);
  let results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirOrFile, entry);
    const entryStats = await fs.stat(fullPath);
    if (entryStats.isDirectory()) {
      results = results.concat(await collectLintableFiles(fullPath));
    } else if (entryStats.isFile() && isLintableFile(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Checks if a file has a valid lintable extension
function isLintableFile(filename: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(filename);
}

// Reads file content, chunks the code, and gathers lint suggestions
export async function gatherLintSuggestions(
  files: string[],
): Promise<LintSuggestion[]> {
  const results: LintSuggestion[] = [];
  for (const filePath of files) {
    const code = await fs.readFile(filePath, "utf-8");
    const fileSuggestions = await chunkAndRequest(filePath, code);
    results.push(...fileSuggestions);
  }
  return results;
}

// Splits file code into chunks and requests lint suggestions for each chunk
export async function chunkAndRequest(
  filePath: string,
  code: string,
): Promise<LintSuggestion[]> {
  const lines = code.split("\n");
  const chunkSize = 150;
  const suggestions: LintSuggestion[] = [];

  for (let i = 0; i < lines.length; i += chunkSize) {
    const slice = lines.slice(i, i + chunkSize);
    const chunk = slice.join("\n");
    const offset = i; // Adjusts line numbers based on chunk start
    const chunkSuggestions = await requestLintSuggestions(
      filePath,
      chunk,
      offset,
    );
    suggestions.push(...chunkSuggestions);
  }
  return suggestions;
}

// Sends file chunk to GPT-3.5 and returns lint suggestions
export async function requestLintSuggestions(
  filePath: string,
  chunk: string,
  offset: number,
): Promise<LintSuggestion[]> {
  const systemMessage = `
You are an ESLint-like reviewer. Return valid JSON array only.
Each item has: filePath, startLine, endLine, suggestion.
Keep line numbers relative to the full file, offset is ${offset}.
`;

  const response = await generateText({
    model: openai("gpt-3.5-turbo"),
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: `path: ${filePath}\n\n${chunk}` },
    ],
    maxTokens: 800,
  });

  let suggestions: LintSuggestion[] = [];
  try {
    const parsed = JSON.parse(response.text as string) as LintSuggestion[];
    if (!Array.isArray(parsed)) {
      throw new Error("GPT did not return an array of suggestions.");
    }
    parsed.forEach((s) => {
      s.startLine += offset;
      s.endLine += offset;
    });
    suggestions = parsed;
  } catch {
    suggestions = [
      {
        filePath,
        startLine: offset,
        endLine: offset,
        suggestion: `GPT-3.5 returned invalid JSON. Output:\n${response.text}`,
      },
    ];
  }

  return suggestions;
}

// Writes the lint suggestions to a JSON file
export async function writeSuggestionsToFile(
  suggestions: LintSuggestion[],
): Promise<void> {
  await fs.writeFile(
    "relinter.json",
    JSON.stringify(suggestions, null, 2),
    "utf-8",
  );
}
