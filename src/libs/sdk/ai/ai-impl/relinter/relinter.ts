import { confirmPrompt, relinka } from "@reliverse/prompts";
import { generateText } from "ai";
import fs from "fs-extra";
import { countTokens } from "gpt-tokenizer/model/gpt-4o-mini";
import path from "pathe";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import {
  CIRCULAR_TRIGGERS,
  MAX_TOKENS,
  MODEL,
  MODEL_NAME,
} from "~/libs/sdk/ai/ai-impl/ai-const.js";

/**
 * Describes a lint suggestion with file details and a recommended fix or note.
 */
export type LintSuggestion = {
  filePath: string;
  startLine: number;
  endLine: number;
  suggestion: string;
  severity: "error" | "warning" | "info";
};

/**
 * Tracks file adjacency for detecting circular dependencies.
 */
type AdjacencyMap = Record<string, string[]>;

/**
 * Calculates how many tokens are used in the given text.
 * @see https://github.com/niieani/gpt-tokenizer#readme
 */
function calculateTokens(content: string): number {
  return countTokens(content);
}

/**
 * Calculates approximate price for the given number of tokens.
 */
function calculatePrice(tokenCount: number): number {
  const costPerThousand = 0.15;
  return (tokenCount / 1000) * costPerThousand;
}

/**
 * Coordinates the relinter process. Accepts multiple target paths.
 */
export async function agentRelinter(
  config: ReliverseConfig,
  targetPaths: string[],
  task?: string,
): Promise<void> {
  try {
    if (
      task &&
      CIRCULAR_TRIGGERS.some((keyword) => task.toLowerCase().includes(keyword))
    ) {
      await handleCircularDependencies(targetPaths);
      return;
    }

    const lintFiles = await collectAllLintableFiles(targetPaths);
    if (lintFiles.length === 0) {
      relinka("info", "No recognized code files found in the specified paths.");
      return;
    }

    relinka(
      "info",
      `Found ${lintFiles.length} file(s). Sending them to Reliverse AI (${MODEL_NAME})...`,
    );

    let promptDecision: boolean | undefined;
    const confirmDecision = config.relinterConfirm;
    if (confirmDecision === "promptEachFile") {
      promptDecision = true;
    } else if (confirmDecision === "promptOnce") {
      promptDecision = false;
    }

    const lintResults = await gatherLintSuggestions(
      lintFiles,
      task,
      promptDecision,
    );
    await writeSuggestionsToFile(lintResults);
    relinka("info", "Lint suggestions written to relinter.json");
  } catch (err: any) {
    relinka("error", "Error:", err.message);
    process.exit(1);
  }
}

/**
 * Collects lintable files from multiple paths into a single list.
 */
async function collectAllLintableFiles(pathsList: string[]): Promise<string[]> {
  const fileSet = new Set<string>();

  for (const rawPath of pathsList) {
    const absolutePath = path.resolve(rawPath);
    const files = await collectLintableFiles(absolutePath);
    for (const f of files) {
      fileSet.add(f);
    }
  }

  return Array.from(fileSet);
}

/**
 * Collects a list of recognized code files from a path.
 */
export async function collectLintableFiles(
  dirOrFile: string,
): Promise<string[]> {
  const stats = await fs.stat(dirOrFile);
  if (stats.isFile()) {
    return isCodeFile(dirOrFile) ? [dirOrFile] : [];
  }

  const entries = await fs.readdir(dirOrFile);
  let results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirOrFile, entry);
    const entryStats = await fs.stat(fullPath);

    if (entryStats.isDirectory()) {
      results = results.concat(await collectLintableFiles(fullPath));
    } else if (entryStats.isFile() && isCodeFile(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Determines if a file has a recognized programming extension.
 */
function isCodeFile(filename: string): boolean {
  const recognizedExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
    "cc",
    "hpp",
    "cs",
    "go",
    "rs",
    "php",
    "rb",
    "m",
    "mm",
    "scala",
    "kt",
    "kts",
    "swift",
    "dart",
    "sh",
    "bash",
    "zsh",
    "lua",
    "el",
    "ex",
    "elm",
    "clj",
    "cljs",
    "coffee",
    "perl",
    "pm",
    "pl",
    "groovy",
    "gradle",
    "sql",
    "yml",
    "yaml",
    "toml",
    "ini",
    "config",
    "json",
    "jsonc",
    "xml",
    "html",
    "css",
    "scss",
    "sass",
    "dockerfile",
    "makefile",
    "cmake",
    "asm",
    "vue",
    "svelte",
    "pwn",
    "inc",
  ];

  const ext = path.extname(filename).toLowerCase().replace(/^\./, "");
  const base = path.basename(filename).toLowerCase();
  return (
    recognizedExtensions.includes(ext) || recognizedExtensions.includes(base)
  );
}

/**
 * Gathers lint suggestions for each file.
 */
export async function gatherLintSuggestions(
  files: string[],
  task?: string,
  promptDecision?: boolean,
): Promise<LintSuggestion[]> {
  const results: LintSuggestion[] = [];
  for (const filePath of files) {
    const code = await fs.readFile(filePath, "utf-8");
    const fileChunks = chunkFile(code, 150);

    for (const { content, offset } of fileChunks) {
      const suggestions = await requestLintSuggestions(
        filePath,
        content,
        offset,
        task,
        promptDecision,
      );
      results.push(...suggestions);
    }
  }
  return results;
}

/**
 * Splits file content into chunks of the specified size.
 */
function chunkFile(
  code: string,
  size: number,
): { content: string; offset: number }[] {
  const lines = code.split("\n");
  const chunks: { content: string; offset: number }[] = [];

  for (let i = 0; i < lines.length; i += size) {
    const slice = lines.slice(i, i + size);
    chunks.push({
      content: slice.join("\n"),
      offset: i,
    });
  }

  return chunks;
}

/**
 * Requests AI-generated lint suggestions for a file chunk.
 */
async function requestLintSuggestions(
  filePath: string,
  chunk: string,
  offset: number,
  task?: string,
  promptDecision?: boolean,
): Promise<LintSuggestion[]> {
  let systemMessage = `
You are an ESLint-like reviewer for all kinds of programming languages.
Return valid JSON array only.
Each item must have the following fields:
- filePath (string)
- startLine (number)
- endLine (number)
- suggestion (string)
- severity (one of: "error", "warning", "info")

Keep line numbers relative to the full file, offset is ${offset}.
`;

  if (task) {
    systemMessage += `\nAdditional instructions: ${task}\n`;
  }

  const combinedText = systemMessage + chunk;
  const tokenCount = calculateTokens(combinedText);
  const tokenCost = calculatePrice(tokenCount);

  if (promptDecision === false) {
    const confirmMsg = `Token usage for ${filePath} [offset ${offset}]: ${tokenCount} tokens (~$${tokenCost.toFixed(
      4,
    )} USD)`;
    const confirmed = await confirmPrompt({
      title: "Confirm Token Usage",
      content: confirmMsg,
    });
    if (!confirmed) {
      return [];
    }
  }

  const response = await generateText({
    model: MODEL,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: `path: ${filePath}\n\n${chunk}` },
    ],
    maxTokens: MAX_TOKENS,
  });

  let suggestions: LintSuggestion[] = [];
  let text = response.text as string;

  const codeFenceRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = codeFenceRegex.exec(text);
  if (match?.[1]) {
    text = match[1].trim();
  }

  try {
    const parsed = JSON.parse(text) as LintSuggestion[];
    if (!Array.isArray(parsed)) {
      throw new Error(`Reliverse AI (${MODEL_NAME}) did not return an array.`);
    }
    parsed.forEach((s) => {
      s.startLine += offset;
      s.endLine += offset;
      if (!s.severity || !["error", "warning", "info"].includes(s.severity)) {
        s.severity = "warning";
      }
    });
    suggestions = parsed;
  } catch {
    suggestions = [
      {
        filePath,
        startLine: offset,
        endLine: offset,
        suggestion: `Reliverse AI (${MODEL_NAME}) returned invalid JSON. Output:\n${response.text}`,
        severity: "warning",
      },
    ];
  }

  return suggestions;
}

/**
 * Persists lint suggestions to a JSON file.
 */
export async function writeSuggestionsToFile(
  suggestions: LintSuggestion[],
): Promise<void> {
  await fs.writeFile(
    "relinter.json",
    JSON.stringify(suggestions, null, 2),
    "utf-8",
  );
}

/**
 * Builds adjacency maps for all files, then detects circular dependencies.
 */
async function handleCircularDependencies(
  targetPaths: string[],
): Promise<void> {
  const lintFiles = await collectAllLintableFiles(targetPaths);
  if (lintFiles.length === 0) {
    relinka("info", "No recognized code files found in the specified paths.");
    return;
  }

  const adjacency: AdjacencyMap = {};
  for (const filePath of lintFiles) {
    adjacency[filePath] = [];
    const code = await fs.readFile(filePath, "utf-8");
    const importRegex =
      /import\s+(?:(?:[\w*\s{},]+)\s+from\s+)?["']([^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(code)) !== null) {
      const imported = match[1];
      if (
        imported &&
        (imported.startsWith("./") ||
          imported.startsWith("../") ||
          imported.startsWith("/"))
      ) {
        const resolvedImport = path.resolve(path.dirname(filePath), imported);
        if (lintFiles.includes(resolvedImport)) {
          adjacency[filePath].push(resolvedImport);
        }
      }
    }
  }

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const cycles: string[][] = [];

  const dfs = (node: string, pathStack: string[]) => {
    visited[node] = true;
    recStack[node] = true;
    pathStack.push(node);

    for (const neighbor of adjacency[node] ?? []) {
      if (!visited[neighbor]) {
        dfs(neighbor, pathStack);
      } else if (recStack[neighbor]) {
        const cycleStartIndex = pathStack.indexOf(neighbor);
        const cycle = pathStack.slice(cycleStartIndex);
        cycles.push([...cycle, neighbor]);
      }
    }

    pathStack.pop();
    recStack[node] = false;
  };

  for (const filePath of lintFiles) {
    if (!visited[filePath]) {
      dfs(filePath, []);
    }
  }

  const suggestions: LintSuggestion[] = [];
  if (cycles.length === 0) {
    relinka("info", "No circular dependencies found.");
  } else {
    let i = 0;
    for (const cycle of cycles) {
      i++;
      if (cycle[0]) {
        suggestions.push({
          filePath: cycle[0],
          startLine: 0,
          endLine: 0,
          suggestion: `Detected circular dependency #${i}: ${cycle.join(" -> ")}`,
          severity: "error",
        });
      }
    }
    relinka("error", `Detected ${cycles.length} circular dependency(ies).`);
  }

  await writeSuggestionsToFile(suggestions);
}
