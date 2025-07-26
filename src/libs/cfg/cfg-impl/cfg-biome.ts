import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { parseJSONC } from "confbox";

import type { BiomeConfig, BiomeConfigResult } from "./cfg-types";

let cachedBiomeConfig: BiomeConfigResult = null;

export async function getBiomeConfig(
  projectPath: string,
): Promise<BiomeConfigResult> {
  if (cachedBiomeConfig !== null) {
    return cachedBiomeConfig;
  }

  try {
    const biomePath = path.join(projectPath, "biome.jsonc");
    if (await fs.pathExists(biomePath)) {
      const content = await fs.readFile(biomePath, "utf-8");

      const config = parseJSONC(content) as BiomeConfig;
      cachedBiomeConfig = {
        lineWidth: config.formatter?.lineWidth ?? 80,
        indentStyle: config.formatter?.indentStyle ?? "space",
        indentWidth: config.formatter?.indentWidth ?? 2,
        quoteMark: config.javascript?.formatter?.quoteStyle ?? "double",
        semicolons: config.javascript?.formatter?.semicolons === "always",
        trailingComma: config.javascript?.formatter?.trailingComma === "all",
      };
      return cachedBiomeConfig;
    }
  } catch (error) {
    relinka(
      "verbose",
      "Error reading biome config:",
      error instanceof Error ? error.message : String(error),
    );
  }
  cachedBiomeConfig = null;
  return null;
}
