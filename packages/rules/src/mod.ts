import { existsSync } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findEscapedFiles, unconvertFile } from "@reliverse/rse-escaper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getAvailableFiles(): Promise<string[]> {
  const escapedDir = join(__dirname, "escaped");
  const allFiles = await findEscapedFiles(escapedDir, true);
  return allFiles.map((file) => relative(escapedDir, file));
}

export async function bootstrap(
  selectedFiles?: string[],
  outputDir?: string,
  options?: {
    backup?: boolean;
  },
): Promise<string[]> {
  const escapedDir = join(__dirname, "escaped");
  const targetDir = outputDir ?? join(__dirname, "rules");

  const allFiles = await findEscapedFiles(escapedDir, true);
  const filesToProcess = selectedFiles
    ? allFiles.filter((file) => {
        const fileName = relative(escapedDir, file);
        return selectedFiles.includes(fileName);
      })
    : allFiles;

  const outputFiles: string[] = [];

  const shouldBackup = options?.backup !== false;

  for (const file of filesToProcess) {
    const relPath = relative(escapedDir, file);
    const ext = extname(relPath);
    const outputFile =
      ext === ".ts" || ext === ".js"
        ? join(targetDir, relPath.slice(0, -ext.length))
        : join(targetDir, relPath.slice(0, -3));
    if (shouldBackup && existsSync(outputFile)) {
      const backupFile = `${outputFile}.bak`;
      if (existsSync(backupFile)) {
        await unlink(backupFile);
      }
      await rename(outputFile, backupFile);
    }
    await unconvertFile(file, outputFile);
    outputFiles.push(outputFile);
  }

  return outputFiles;
}
