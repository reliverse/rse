import { confirmPrompt, inputPrompt, relinka } from "@reliverse/prompts";
import { generateText } from "ai";
import { execaCommand } from "execa";
import fs from "fs-extra";
import path from "pathe";
import { glob } from "tinyglobby";

import { MODEL } from "~/libs/sdk/ai/ai-impl/ai-const.js";

type AiGeneratedResult = {
  text: string;
};

type ParsedAiOutput = {
  filePath: string;
  codeContent: string;
};

type CommitOptions = {
  commitMessage: string;
};

// Fetches user's code prompt
async function getUserPrompt(): Promise<string> {
  const response = await inputPrompt({
    title: "AI Code Generation",
    content: "Describe the code you want to generate:",
  });
  return response;
}

// Generates code from AI
async function generateAiContent(
  userDescription: string,
): Promise<AiGeneratedResult> {
  const result = await generateText({
    model: MODEL,
    system: `ALWAYS follow these rules:
1. First line must be filepath comment: "// {filepath}"
2. Use absolute paths from project root
3. For modifications, include original code context
4. Support TS, JS, JSON and MD formats
5. Add TypeScript types where possible
6. Use "~/" paths relative from "src"
7. Prefer async/await over sync
8. Your name is Reliverse AI`,
    prompt: userDescription,
  });
  return { text: result.text };
}

// Parses AI output into file path and content
function parseAiOutput(aiText: string): ParsedAiOutput {
  const [pathLine = "", ...codeLines] = aiText.split("\n");
  const filePath = pathLine.replace(/^\/\/\s*/, "").trim();
  const codeContent = codeLines.join("\n");
  return { filePath, codeContent };
}

// Checks if a file is modified in Git
async function isFileModified(filePath: string): Promise<boolean> {
  try {
    const status = (await execaCommand(`git status --porcelain ${filePath}`))
      .stdout;
    return status.trim().startsWith("M");
  } catch {
    return false;
  }
}

// Confirms overwrite if a file is modified
async function confirmOverwrite(filePath: string): Promise<boolean> {
  const modified = await isFileModified(filePath);
  if (!modified) {
    return true;
  }
  const confirmed = await confirmPrompt({
    title: "Git Modification Warning",
    content: `File ${path.basename(filePath)} has uncommitted changes. Overwrite?`,
    defaultValue: false,
  });
  return confirmed;
}

// Writes file safely, ensuring directories exist
async function writeFileSafe(filePath: string, content: string): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(absolutePath);

  if (!(await fs.pathExists(dir))) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Use flag "wx" so it throws if file exists; we remove existing file separately
  await fs.writeFile(absolutePath, content, { flag: "wx" });
}

// Optionally format file
async function maybeFormatFile(filePath: string): Promise<void> {
  const doFormat = await confirmPrompt({
    title: "Code Formatting",
    content: `Would you like to format ${path.basename(filePath)} with Biome?`,
    defaultValue: false,
  });
  if (!doFormat) {
    return;
  }
  await execaCommand(`bun x biome check --write "${filePath}"`, {
    stdio: "inherit",
  });
}

// Prompts the user to create a commit
async function maybeCommitFile(filePath: string): Promise<void> {
  const shouldCommit = await confirmPrompt({
    title: "Git Commit",
    content: "Do you want to commit these changes?",
    defaultValue: false,
  });
  if (!shouldCommit) {
    return;
  }

  const commitMessage = await inputPrompt({
    title: "Commit Message",
    content: "Enter a commit message:",
  });

  await commitChanges(filePath, { commitMessage });
}

// Stages and commits changes
async function commitChanges(
  filePath: string,
  options: CommitOptions,
): Promise<void> {
  await execaCommand(`git add ${filePath}`, { stdio: "inherit" });
  await execaCommand(`git commit -m "${options.commitMessage}"`, {
    stdio: "inherit",
  });
}

/**
 * Main command entry.
 * @param fileOrFolderPatterns  Optional glob patterns to match existing files/folders
 * @param notifyPerFile         Notify about uncommitted changes per file (true) or only once (false)
 */
export async function aiCodeCommand(
  fileOrFolderPatterns: string[] = [],
  notifyPerFile = false,
): Promise<void> {
  // 1. AI generation and handling for a single new file
  const userPrompt = await getUserPrompt();
  const { text: aiText } = await generateAiContent(userPrompt);
  const { filePath, codeContent } = parseAiOutput(aiText);

  if (!filePath) {
    throw new Error("AI failed to provide valid file path");
  }

  const canOverwrite = await confirmOverwrite(filePath);
  if (!canOverwrite) {
    relinka("info", "Operation cancelled");
    process.exit(0);
  }

  let fileExists = false;
  if (await fs.pathExists(filePath)) {
    fileExists = true;
    await fs.rm(filePath);
  }

  await writeFileSafe(filePath, codeContent);
  await maybeFormatFile(filePath);
  await maybeCommitFile(filePath);

  relinka(
    "info",
    `Successfully ${fileExists ? "updated" : "created"} ${filePath}`,
  );

  // 2. Handle additional file/folder patterns via tinyglobby
  if (!fileOrFolderPatterns.length) {
    return;
  }

  const matchedPaths = await glob(fileOrFolderPatterns, { absolute: false });
  if (!matchedPaths.length) {
    relinka("info", "No files matched the given patterns.");
    return;
  }

  // If we only want a single confirmation if any file is modified
  if (!notifyPerFile) {
    let anyModified = false;
    for (const p of matchedPaths) {
      if (await isFileModified(p)) {
        anyModified = true;
        break;
      }
    }

    if (anyModified) {
      const confirmAll = await confirmPrompt({
        title: "Git Modification Warning",
        content: "One or more matched files are modified. Continue anyway?",
        defaultValue: false,
      });
      if (!confirmAll) {
        relinka("info", "Operation cancelled for matched files.");
        return;
      }
    }
  } else {
    // Check each file individually
    for (const p of matchedPaths) {
      const modified = await isFileModified(p);
      if (modified) {
        const confirmThis = await confirmPrompt({
          title: "Git Modification Warning",
          content: `File ${path.basename(p)} has uncommitted changes. Continue anyway?`,
          defaultValue: false,
        });
        if (!confirmThis) {
          relinka("info", `Operation cancelled for ${p}.`);
        }
      }
    }
  }

  relinka("info", "Matched files processed successfully.");
}
