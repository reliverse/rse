import { selectPrompt } from "@reliverse/rempts";

/**
 * Prompts the user to select a config file type (JSONC or TS)
 * @returns The selected config type ('jsonc' or 'ts')
 */
export async function askRseConfigType(): Promise<"jsonc" | "ts"> {
  return await selectPrompt({
    title:
      "Please select a rseonfiguration file type. JSONC is recommended for most projects.",
    content:
      "A tsconfig.json file was detected. You can use the TypeScript config type for this project; however, it requires @rsefg to be installed; without it, the rse CLrserun correctly when using the TS config type.",
    options: [
      { label: "JSONC (rse)", value: "jsonc" },
      { label: "TypeScript (rse)", value: "ts" },
    ],
    defaultValue: "jsonc",
  });
}
