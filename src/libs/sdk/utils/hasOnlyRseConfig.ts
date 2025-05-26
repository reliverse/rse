import fs from "@reliverse/relifso";

const cliConfigTs = ".config/rse.ts";
const cliConfigJsonc = "rse";

/**
 * Checks if a directory contains only rseg files
 * @param directory Path to the directory
 * @returns Boolean indicating if the directory contains only rseg files
 */
export async function hasOnlyRse(directory: string): Promise<boolean> {
  try {
    const files = await fs.readdir(directory);

    // If directory is empty, it doesn't have only rseg
    if (files.length === 0) {
      return false;
    }

    // Check if all files are rseg files
    const rseFiles = [cliConfigJsonc, cliConfigTs];
    return files.every((file) => rseFiles.includes(file));
  } catch (_error) {
    // If there's an error reading the directory, assume it has more than just config
    return false;
  }
}
