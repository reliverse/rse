import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import path from "pathe";
import { defineTSConfig, writeTSConfig } from "pkg-types";

/**
 * Creates a minimal tsconfig file for a new project. If `isDev` is true and
 * the project path contains "tests-runtime", the file is saved as "tsconfig.txt"
 * instead of "tsconfig.json".
 */
export async function createTSConfig(
  projectPath: string,
  isLib: boolean,
  isDev: boolean,
): Promise<void> {
  const tsconfig = defineTSConfig({
    compilerOptions: {
      esModuleInterop: true,
      skipLibCheck: true,
      target: "es2022",
      allowJs: true,
      resolveJsonModule: true,
      moduleDetection: "force",
      isolatedModules: true,
      verbatimModuleSyntax: true,
      strict: true,
      noUncheckedIndexedAccess: true,
      noImplicitOverride: true,
      ...(isLib
        ? { lib: ["es2022"] }
        : {
            module: "preserve",
            noEmit: true,
            lib: ["es2022", "dom", "dom.iterable"],
          }),
    },
    ...(isLib
      ? { include: ["**/*.ts"] }
      : { include: ["**/*.ts", "**/*.tsx"] }),
    exclude: ["node_modules"],
  });

  // Determine file extension based on dev mode and tests-runtime path
  const useTxt = isDev && projectPath.includes("tests-runtime");
  const filename = useTxt ? "tsconfig.txt" : "tsconfig.json";

  const tsconfigPath = path.join(projectPath, filename);

  // If we're saving as tsconfig.txt, we can't use writeTSConfig from pkg-types directly
  // because it expects a .json path. We'll just write a JSON string ourselves.
  if (useTxt) {
    const rawContent = JSON.stringify(tsconfig, null, 2);
    await fs.writeFile(tsconfigPath, rawContent, "utf-8");
  } else {
    await writeTSConfig(tsconfigPath, tsconfig);
    const content = await fs.readFile(tsconfigPath, "utf-8");
    const formatted = JSON.stringify(JSON.parse(content), null, 2);
    await fs.writeFile(tsconfigPath, formatted, "utf-8");
  }

  relinka(
    "info-verbose",
    `Created ${filename} with ${isLib ? "library" : "application"} configuration`,
  );
}
