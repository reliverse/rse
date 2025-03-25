import { relinka } from "@reliverse/prompts";
import { generateText } from "ai";
import fs from "fs-extra";
import path from "pathe";

import {
  CIRCULAR_TRIGGERS,
  MAX_TOKENS,
  MODEL,
  MODEL_NAME,
} from "~/arg/ai/ai-const.js";

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
 * Coordinates the relinter process.
 */
export async function agentRelinter(
  targetPath: string,
  task?: string,
): Promise<void> {
  try {
    if (
      task &&
      CIRCULAR_TRIGGERS.some((keyword) => task.toLowerCase().includes(keyword))
    ) {
      await handleCircularDependencies(targetPath);
      return;
    }

    const absoluteTargetPath = path.resolve(targetPath);
    const lintFiles = await collectLintableFiles(absoluteTargetPath);

    if (lintFiles.length === 0) {
      relinka(
        "info",
        "No .js/.jsx/.ts/.tsx files found in the specified path.",
      );
      return;
    }

    relinka(
      "info",
      `Found ${lintFiles.length} file(s). Sending them to Reliverse AI (${MODEL_NAME})...`,
    );

    const lintResults = await gatherLintSuggestions(lintFiles, task);
    await writeSuggestionsToFile(lintResults);
    relinka("info", "Lint suggestions written to relinter.json");
  } catch (err: any) {
    relinka("error", "Error:", err.message);
    process.exit(1);
  }
}

/**
 * Collects a list of lintable files (.js, .jsx, .ts, .tsx) from a path.
 */
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

/**
 * Checks if a file matches typical lintable extensions.
 */
function isLintableFile(filename: string): boolean {
  return /\.(js|jsx|ts|tsx)$/.test(filename);
}

/**
 * Gathers lint suggestions by sending file chunks to an AI model.
 */
export async function gatherLintSuggestions(
  files: string[],
  task?: string,
): Promise<LintSuggestion[]> {
  const results: LintSuggestion[] = [];
  for (const filePath of files) {
    const code = await fs.readFile(filePath, "utf-8");
    const fileSuggestions = await chunkAndRequest(filePath, code, task);
    results.push(...fileSuggestions);
  }
  return results;
}

/**
 * Splits file content into manageable chunks for lint analysis.
 */
export async function chunkAndRequest(
  filePath: string,
  code: string,
  task?: string,
): Promise<LintSuggestion[]> {
  const lines = code.split("\n");
  const chunkSize = 150;
  const suggestions: LintSuggestion[] = [];

  for (let i = 0; i < lines.length; i += chunkSize) {
    const slice = lines.slice(i, i + chunkSize);
    const chunk = slice.join("\n");
    const offset = i;
    const chunkSuggestions = await requestLintSuggestions(
      filePath,
      chunk,
      offset,
      task,
    );
    suggestions.push(...chunkSuggestions);
  }
  return suggestions;
}

/**
 * Requests AI-generated lint suggestions for a specific chunk of code.
 */
export async function requestLintSuggestions(
  filePath: string,
  chunk: string,
  offset: number,
  task?: string,
): Promise<LintSuggestion[]> {
  let systemMessage = `
You are an ESLint-like reviewer. Return valid JSON array only.
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
      throw new Error(
        `Reliverse AI (${MODEL_NAME}) did not return an array of suggestions.`,
      );
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
 * Gathers imports across files, builds adjacency, and detects cycles.
 */
async function handleCircularDependencies(targetPath: string): Promise<void> {
  const absoluteTargetPath = path.resolve(targetPath);
  const lintFiles = await collectLintableFiles(absoluteTargetPath);

  if (lintFiles.length === 0) {
    relinka("info", "No .js/.jsx/.ts/.tsx files found in the specified path.");
    return;
  }

  const adjacency: Record<string, string[]> = {};
  for (const filePath of lintFiles) {
    adjacency[filePath] = [];
    const code = await fs.readFile(filePath, "utf-8");
    const importRegex =
      /import\s+(?:(?:[\w*\s{},]+)\s+from\s+)?["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(code)) !== null) {
      const imported = match[1]!;
      if (
        imported.startsWith("./") ||
        imported.startsWith("../") ||
        imported.startsWith("/")
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

  for (const f of lintFiles) {
    if (!visited[f]) {
      dfs(f, []);
    }
  }

  const suggestions: LintSuggestion[] = [];
  if (cycles.length === 0) {
    relinka("info", "No circular dependencies found.");
  } else {
    let i = 0;
    for (const cycle of cycles) {
      i++;
      suggestions.push({
        filePath: cycle[0]!,
        startLine: 0,
        endLine: 0,
        suggestion: `Detected circular dependency #${i}: ${cycle.join(" -> ")}`,
        severity: "error",
      });
    }
    relinka("error", `Detected ${cycles.length} circular dependency(ies).`);
  }

  await writeSuggestionsToFile(suggestions);
}
