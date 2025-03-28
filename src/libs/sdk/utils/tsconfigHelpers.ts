import fs from "fs-extra";
import path from "pathe";

/**
 * Searches upward from the given path for a tsconfig.json.
 * Returns the full path if found, otherwise undefined.
 */
export async function findTsconfigUp(
  fromPath: string,
): Promise<string | undefined> {
  let currentDir = fromPath;
  const rootPath = path.parse(currentDir).root;

  while (true) {
    const candidate = path.join(currentDir, "tsconfig.json");
    if (await fs.pathExists(candidate)) return candidate;
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir || currentDir === rootPath) break;
    currentDir = parentDir;
  }
  return undefined;
}
