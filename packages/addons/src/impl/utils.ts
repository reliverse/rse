import { exists, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const getWorkspaceScope = (workspace: string): string =>
  `@${workspace.charAt(0)}/`;

export const ensureDir = async (path: string): Promise<void> => {
  const dirExists = await exists(path);
  if (!dirExists) {
    await mkdir(path, { recursive: true });
  }
};

export const fileExists = async (path: string): Promise<boolean> =>
  exists(path);

export const createFullPath = (...paths: string[]): string => join(...paths);
