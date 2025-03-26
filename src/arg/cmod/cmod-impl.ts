import { relinka } from "@reliverse/prompts";
import { execaCommand } from "execa";

/**
 * Runs each codemod one by one using `codemod <name> <optional-flags>`.
 */
export async function runCodemods(
  names: string[],
  options: {
    dry?: boolean;
    format?: boolean;
    include?: string;
    exclude?: string;
  },
) {
  for (const name of names) {
    relinka("info", `\nApplying codemod: ${name}`);
    const cmdArgs = [name];

    // Append flags if set
    if (options.dry) cmdArgs.push("--dry");
    if (options.format) cmdArgs.push("--format");
    if (options.include) cmdArgs.push("-i", options.include);
    if (options.exclude) cmdArgs.push("-e", options.exclude);

    try {
      await execaCommand(`codemod ${cmdArgs}`, { stdio: "inherit" });
      relinka("info", `Successfully ran codemod: ${name}\n`);
    } catch (error) {
      relinka("error", `Failed to run codemod: ${name}`, String(error));
      process.exit(1);
    }
  }
}
