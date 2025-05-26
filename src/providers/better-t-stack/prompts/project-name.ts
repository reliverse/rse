import { cancel, isCancel, text } from "@clack/prompts";
import fs from "@reliverse/relifso";
import path from "node:path";
import pc from "picocolors";

import { DEFAULT_CONFIG } from "~/providers/better-t-stack/constants";

const INVALID_CHARS = ["<", ">", ":", '"', "|", "?", "*"];
const MAX_LENGTH = 255;

function validateDirectoryName(name: string): string | undefined {
  // Allow "." as it represents current directory
  if (name === ".") return undefined;

  if (!name) return "Project name cannot be empty";
  if (name.length > MAX_LENGTH) {
    return `Project name must be less than ${MAX_LENGTH} characters`;
  }
  if (INVALID_CHARS.some((char) => name.includes(char))) {
    return "Project name contains invalid characters";
  }
  if (name.startsWith(".") || name.startsWith("-")) {
    return "Project name cannot start with a dot or dash";
  }
  if (name.toLowerCase() === "node_modules") {
    return "Project name is reserved";
  }
  return undefined;
}

export async function getProjectName(initialName?: string): Promise<string> {
  if (initialName) {
    if (initialName === ".") {
      const projectDir = process.cwd();
      if (fs.readdirSync(projectDir).length === 0) {
        return initialName;
      }
    } else {
      const finalDirName = path.basename(initialName);
      const validationError = validateDirectoryName(finalDirName);
      if (!validationError) {
        const projectDir = path.resolve(process.cwd(), initialName);
        if (
          !fs.pathExistsSync(projectDir) ||
          fs.readdirSync(projectDir).length === 0
        ) {
          return initialName;
        }
      }
    }
  }

  let isValid = false;
  let projectPath = "";
  let defaultName = DEFAULT_CONFIG.projectName;
  let counter = 1;

  while (fs.pathExistsSync(path.resolve(process.cwd(), defaultName))) {
    defaultName = `${DEFAULT_CONFIG.projectName}-${counter}`;
    counter++;
  }

  while (!isValid) {
    const response = await text({
      message:
        "Enter your project name or path (relative to current directory)",
      placeholder: defaultName,
      initialValue: initialName,
      defaultValue: defaultName,
      validate: (value) => {
        const nameToUse = value.trim() || defaultName;

        if (nameToUse === ".") {
          const dirContents = fs.readdirSync(process.cwd());
          if (dirContents.length > 0) {
            return "Current directory is not empty. Please choose a different directory.";
          }
          isValid = true;
          return undefined;
        }

        const projectDir = path.resolve(process.cwd(), nameToUse);
        const finalDirName = path.basename(projectDir);

        const validationError = validateDirectoryName(finalDirName);
        if (validationError) return validationError;

        if (!projectDir.startsWith(process.cwd())) {
          return "Project path must be within current directory";
        }

        if (fs.pathExistsSync(projectDir)) {
          const dirContents = fs.readdirSync(projectDir);
          if (dirContents.length > 0) {
            return `Directory "${nameToUse}" already exists and is not empty. Please choose a different name or path.`;
          }
        }

        isValid = true;
        return undefined;
      },
    });

    if (isCancel(response)) {
      cancel(pc.red("Operation cancelled."));
      process.exit(0);
    }

    projectPath = response || defaultName;
  }

  return projectPath;
}
