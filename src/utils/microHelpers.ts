import { getTerminalHeight } from "@reliverse/prompts";

/**
 * Helper function to compute maximum items based on terminal height.
 * @returns Number of maximum items allowed.
 */
export function getMaxHeightSize(): number {
  const hSize = getTerminalHeight();
  return hSize < 30 ? 10 : hSize;
}

/**
 * Sleeps for the specified number of milliseconds.
 * @param ms - Milliseconds to sleep.
 * @returns A promise that resolves after the given time.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
