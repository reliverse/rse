// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/biome-formatter.ts

import path from "@reliverse/dler-pathkit";

function isSupportedFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const supportedExtensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".jsonc"];
  return supportedExtensions.includes(ext);
}

function shouldSkipFile(filePath: string) {
  const basename = path.basename(filePath);
  const skipPatterns = [
    ".hbs",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lock",
    ".d.ts",
  ];

  return skipPatterns.some((pattern) => basename.includes(pattern));
}

export function formatFileWithBiome(filePath: string, content: string) {
  if (!isSupportedFile(filePath) || shouldSkipFile(filePath)) {
    return null;
  }

  // Zero-deps formatter: return content as-is (no-op)
  // The original Biome formatter is replaced with a no-op to eliminate @biomejs/js-api dependency
  // Formatting should be handled by the project's Biome CLI using: bun format
  return content;
}
