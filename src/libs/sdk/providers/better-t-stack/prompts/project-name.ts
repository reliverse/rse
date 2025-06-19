import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { cancel, isCancel, text } from "@reliverse/rempts";
import path from "node:path";

import { DEFAULT_CONFIG } from "~/libs/sdk/providers/better-t-stack/constants";
import { ProjectNameSchema } from "~/libs/sdk/providers/better-t-stack/types";

function validateDirectoryName(name: string): string | undefined {
  if (name === ".") return undefined;

  const result = ProjectNameSchema.safeParse(name);
  if (!result.success) {
    return result.error.issues[0]?.message || "Invalid project name";
  }
  return undefined;
}

export async function getProjectName(initialName?: string): Promise<string> {
  if (initialName) {
    if (initialName === ".") {
      return initialName;
    }
    const finalDirName = path.basename(initialName);
    const validationError = validateDirectoryName(finalDirName);
    if (!validationError) {
      return initialName;
    }
  }

  let isValid = false;
  let projectPath = "";
  let defaultName = DEFAULT_CONFIG.projectName;
  let counter = 1;

  while (
    fs.pathExistsSync(path.resolve(process.cwd(), defaultName)) &&
    fs.readdirSync(path.resolve(process.cwd(), defaultName)).length > 0
  ) {
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
      validate: (value: string) => {
        const nameToUse = value.trim() || defaultName;

        const finalDirName = path.basename(nameToUse);
        const validationError = validateDirectoryName(finalDirName);
        if (validationError) return validationError;

        if (nameToUse !== ".") {
          const projectDir = path.resolve(process.cwd(), nameToUse);
          if (!projectDir.startsWith(process.cwd())) {
            return "Project path must be within current directory";
          }
        }

        return undefined;
      },
    });

    if (isCancel(response)) {
      cancel(re.red("Operation cancelled."));
      process.exit(0);
    }

    projectPath = response || defaultName;
    isValid = true;
  }

  return projectPath;
}
