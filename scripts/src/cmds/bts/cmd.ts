import { existsSync, rmSync } from "node:fs";
import { exists, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { confirmPrompt, isCancel } from "@reliverse/dler-prompt";
import { $ } from "bun";

const REPO_URL = "https://github.com/AmanVarshney01/create-better-t-stack";
const REPO_NAME = "create-better-t-stack";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function generateModTsContent(version: string): string {
  return [
    `// Auto-generated mod.ts from Better-T-Stack v${version}`,
    "// Source: https://github.com/AmanVarshney01/create-better-t-stack",
    "// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts",
    "",
    'import { re } from "@reliverse/dler-colors";',
    'import { logger } from "@reliverse/dler-logger";',
    "import {",
    "  addAddonsHandler,",
    "  createProjectHandler,",
    '} from "./impl/helpers/core/command-handlers";',
    "import type {",
    "  AddInput,",
    "  Addons,",
    "  API,",
    "  Backend,",
    "  BetterTStackConfig,",
    "  CreateInput,",
    "  Database,",
    "  DatabaseSetup,",
    "  DirectoryConflict,",
    "  Examples,",
    "  Frontend,",
    "  InitResult,",
    "  ORM,",
    "  PackageManager,",
    "  ProjectConfig,",
    "  Runtime,",
    "  ServerDeploy,",
    "  WebDeploy,",
    '} from "./impl/types";',
    'import { handleError } from "./impl/utils/errors";',
    'import { openUrl } from "./impl/utils/open-url";',
    'import { renderTitle } from "./impl/utils/render-title";',
    'import { displaySponsors, fetchSponsors } from "./impl/utils/sponsors";',
    "",
    "/**",
    " * Initialize a new Better-T-Stack project",
    " *",
    " * @example CLI usage:",
    " * ```bash",
    " * npx create-better-t-stack my-app --yes",
    " * ```",
    " *",
    " * @example Programmatic usage (always returns structured data):",
    " * ```typescript",
    " *  *",
    ' * const result = await init("my-app", {',
    " *   yes: true,",
    ' *   frontend: ["tanstack-router"],',
    ' *   backend: "hono",',
    ' *   database: "sqlite",',
    ' *   orm: "drizzle",',
    ' *   auth: "better-auth",',
    ' *   addons: ["biome", "turborepo"],',
    ' *   packageManager: "bun",',
    " *   install: false,",
    ' *   directoryConflict: "increment", // auto-handle conflicts',
    " *   disableAnalytics: true, // disable analytics",
    " * });",
    " *",
    " * if (result.success) {",
    " *   console.log(`Project created at: \\u0024{result.projectDirectory}`);",
    " *   console.log(`Reproducible command: \\u0024{result.reproducibleCommand}`);",
    " *   console.log(`Time taken: \\u0024{result.elapsedTimeMs}ms`);",
    " * }",
    " * ```",
    " */",
    "export async function init(projectName?: string, options?: CreateInput) {",
    "  const opts = (options ?? {}) as CreateInput;",
    "  const combinedInput = {",
    "    projectName,",
    "    ...opts,",
    "  };",
    "  const result = await createProjectHandler(combinedInput);",
    "  return result as InitResult;",
    "}",
    "",
    "export async function add(options?: AddInput) {",
    "  await addAddonsHandler(options ?? {});",
    "}",
    "",
    "export async function sponsors() {",
    "  try {",
    "    renderTitle();",
    '    logger.info(re.magenta("Better-T-Stack Sponsors"));',
    "    const sponsors = await fetchSponsors();",
    "    displaySponsors(sponsors);",
    "  } catch (error) {",
    '    handleError(error, "Failed to display sponsors");',
    "  }",
    "}",
    "",
    "export async function docs() {",
    '  const DOCS_URL = "https://better-t-stack.dev/docs";',
    "  try {",
    "    await openUrl(DOCS_URL);",
    '    logger.success(re.blue("Opened docs in your default browser."));',
    "  } catch {",
    "    logger.log(`Please visit \\u0024{DOCS_URL}`);",
    "  }",
    "}",
    "",
    "export async function builder() {",
    '  const BUILDER_URL = "https://better-t-stack.dev/new";',
    "  try {",
    "    await openUrl(BUILDER_URL);",
    '    logger.success(re.blue("Opened builder in your default browser."));',
    "  } catch {",
    "    logger.log(`Please visit \\u0024{BUILDER_URL}`);",
    "  }",
    "}",
    "",
    "export type {",
    "  Database,",
    "  ORM,",
    "  Backend,",
    "  Runtime,",
    "  Frontend,",
    "  Addons,",
    "  Examples,",
    "  PackageManager,",
    "  DatabaseSetup,",
    "  API,",
    "  WebDeploy,",
    "  ServerDeploy,",
    "  DirectoryConflict,",
    "  CreateInput,",
    "  AddInput,",
    "  ProjectConfig,",
    "  BetterTStackConfig,",
    "  InitResult,",
    "};",
    "",
    "",
  ].join("\n");
}

function getCacheDirectory(): string {
  return join(homedir(), ".reliverse", "dler", "cache", "bts");
}

function getCacheTimestampPath(): string {
  return join(getCacheDirectory(), ".timestamp");
}

function getCachedRepoPath(): string {
  return join(getCacheDirectory(), REPO_NAME);
}

async function isCacheValid(): Promise<boolean> {
  const cachedRepo = getCachedRepoPath();
  const timestampPath = getCacheTimestampPath();

  // Check if cache exists
  const cacheExists = await exists(cachedRepo);
  const timestampExists = await exists(timestampPath);

  if (!cacheExists || !timestampExists) {
    return false;
  }

  // Check if timestamp is valid
  try {
    const timestampContent = await readFile(timestampPath, "utf-8");
    const lastDownloadTime = Number.parseInt(timestampContent.trim(), 10);

    if (Number.isNaN(lastDownloadTime)) {
      return false;
    }

    const now = Date.now();
    const age = now - lastDownloadTime;

    return age < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

async function updateCacheTimestamp(): Promise<void> {
  const cacheDir = getCacheDirectory();
  const timestampPath = getCacheTimestampPath();

  await mkdir(cacheDir, { recursive: true });
  await writeFile(timestampPath, Date.now().toString(), "utf-8");
}

function transformFileContent(
  content: string,
  originalFilePath?: string,
): string {
  let transformed = content;

  // Generate header comment with link to original file
  let headerComment = "";
  if (originalFilePath) {
    // Convert file path to GitHub URL
    // Original path: apps/cli/src/utils/display-config.ts
    // GitHub URL: https://github.com/AmanVarshney01/create-better-t-stack/blob/main/apps/cli/src/utils/display-config.ts
    const githubUrl = `https://github.com/AmanVarshney01/create-better-t-stack/blob/main/${originalFilePath}`;
    headerComment = `// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// ${githubUrl}

`;
  } else {
    // Fallback if no original path provided
    headerComment = `// This file is auto-generated. To contribute: edit scripts/src/cmds/bts/cmd.ts codemod OR the original repo:
// https://github.com/AmanVarshney01/create-better-t-stack

`;
  }

  // Check if header already exists (to avoid duplicates)
  if (!transformed.includes("This file is auto-generated")) {
    // Remove existing shebang if present
    const shebangMatch = transformed.match(/^#!.*\n/);
    if (shebangMatch) {
      transformed = transformed.replace(
        /^#!.*\n/,
        `${shebangMatch[0]}${headerComment}`,
      );
    } else {
      // Add header at the beginning
      transformed = `${headerComment}${transformed}`;
    }
  }

  // Replace biome-formatter.ts with zero external deps alternative
  if (originalFilePath?.endsWith("biome-formatter.ts")) {
    const zeroDepsBiomeFormatter = `${headerComment}import path from "@reliverse/dler-pathkit";

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
`;
    return zeroDepsBiomeFormatter;
  }

  // Replace @clack/prompts imports - handle spinner separately
  // Check if import contains spinner
  transformed = transformed.replace(
    /import\s+\{([^}]*)\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    (_match, imports) => {
      const importList = imports.split(",").map((i: string) => i.trim());
      const hasSpinner = importList.some((i: string) => i === "spinner");
      const hasSelect = importList.some((i: string) => i === "select");
      const hasGroup = importList.some((i: string) => i === "group");
      const hasMultiselect = importList.some(
        (i: string) => i === "multiselect" || i === "autocompleteMultiselect",
      );
      const hasText = importList.some((i: string) => i === "text");
      const hasConfirm = importList.some((i: string) => i === "confirm");
      const hasIsCancel = importList.some((i: string) => i === "isCancel");
      const hasExitCancelled = importList.some(
        (i: string) => i === "exitCancelled",
      );
      const hasLogOrOutro = importList.some(
        (i: string) => i === "log" || i === "outro",
      );
      const otherImports = importList.filter(
        (i: string) =>
          i !== "spinner" &&
          i !== "select" &&
          i !== "multiselect" &&
          i !== "autocompleteMultiselect" &&
          i !== "text" &&
          i !== "confirm" &&
          i !== "log" &&
          i !== "outro" &&
          i !== "isCancel" &&
          i !== "exitCancelled",
      );

      const result: string[] = [];

      // Add logger import if log or outro are present
      if (hasLogOrOutro || otherImports.length > 0) {
        result.push('import { logger } from "@reliverse/dler-logger";');
      }

      // Add createSpinner import if spinner is present
      if (hasSpinner) {
        result.push('import { createSpinner } from "@reliverse/dler-spinner";');
      }

      // Add selectPrompt import if select is present
      if (hasSelect) {
        result.push('import { selectPrompt } from "@reliverse/dler-prompt";');
      }
      if (hasGroup) {
        result.push('import { groupPrompt } from "@reliverse/dler-prompt";');
      }

      // Add multiselectPrompt import if multiselect is present
      if (hasMultiselect) {
        result.push(
          'import { multiselectPrompt } from "@reliverse/dler-prompt";',
        );
      }

      // Add inputPrompt import if text is present
      if (hasText) {
        result.push('import { inputPrompt } from "@reliverse/dler-prompt";');
      }

      // Add confirmPrompt import if confirm is present
      if (hasConfirm) {
        result.push('import { confirmPrompt } from "@reliverse/dler-prompt";');
      }

      // Add isCancel and exitCancelled imports if present
      const promptImports: string[] = [];
      if (
        hasIsCancel ||
        hasExitCancelled ||
        hasSelect ||
        hasMultiselect ||
        hasGroup ||
        hasText ||
        hasConfirm
      ) {
        const promptImportList: string[] = [];
        if (hasSelect) promptImportList.push("selectPrompt");
        if (hasGroup) promptImportList.push("groupPrompt");
        if (hasMultiselect) promptImportList.push("multiselectPrompt");
        if (hasText) promptImportList.push("inputPrompt");
        if (hasConfirm) promptImportList.push("confirmPrompt");
        if (hasIsCancel) promptImportList.push("isCancel");
        if (hasExitCancelled) promptImportList.push("exitCancelled");
        if (promptImportList.length > 0) {
          promptImports.push(
            `import { ${promptImportList.join(", ")} } from "@reliverse/dler-prompt";`,
          );
        }
      }
      // Merge prompt imports if we already have one
      if (promptImports.length > 0) {
        // Check if we already added a prompt import
        const hasExistingPromptImport = result.some((r) =>
          r.includes("@reliverse/dler-prompt"),
        );
        if (hasExistingPromptImport) {
          // Merge with existing import
          const existingIndex = result.findIndex((r) =>
            r.includes("@reliverse/dler-prompt"),
          );
          if (existingIndex !== -1 && result[existingIndex]) {
            const existing = result[existingIndex];
            const existingMatch = existing.match(/\{([^}]*)\}/)?.[1];
            if (existingMatch) {
              const existingImports = existingMatch
                .split(",")
                .map((i) => i.trim())
                .filter((i) => i);
              const newImports = [
                ...existingImports,
                ...(hasIsCancel ? ["isCancel"] : []),
                ...(hasExitCancelled ? ["exitCancelled"] : []),
              ]
                .filter((v, i, a) => a.indexOf(v) === i)
                .sort();
              result[existingIndex] =
                `import { ${newImports.join(", ")} } from "@reliverse/dler-prompt";`;
            }
          }
        } else {
          result.push(...promptImports);
        }
      }

      // If no matches, default to logger
      if (result.length === 0) {
        result.push('import { logger } from "@reliverse/dler-logger";');
      }

      return `${result.join("\n")}\n`;
    },
  );
  transformed = transformed.replace(
    /import\s+.*\s+from\s+["']@clack\/prompts["'];?\n?/g,
    'import { logger } from "@reliverse/dler-logger";\n',
  );

  // Replace consola imports - replace with logger
  transformed = transformed.replace(
    /import\s+consola\s+from\s+["']consola["'];?\n?/g,
    'import { logger } from "@reliverse/dler-logger";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*consola[^}]*\}\s+from\s+["']consola["'];?\n?/g,
    'import { logger } from "@reliverse/dler-logger";\n',
  );

  // Replace picocolors imports
  transformed = transformed.replace(
    /import\s+pc\s+from\s+["']picocolors["'];?\n?/g,
    'import { re } from "@reliverse/dler-colors";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*\}\s+from\s+["']picocolors["'];?\n?/g,
    'import { re } from "@reliverse/dler-colors";\n',
  );

  // Replace fs-extra imports with @reliverse/dler-fs-utils
  transformed = transformed.replace(
    /import\s+fs\s+from\s+["']fs-extra["'];?\n?/g,
    'import fs from "@reliverse/dler-fs-utils";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*fs[^}]*\}\s+from\s+["']fs-extra["'];?\n?/g,
    'import fs from "@reliverse/dler-fs-utils";\n',
  );

  // Replace node:path imports with @reliverse/dler-pathkit
  transformed = transformed.replace(
    /import\s+path\s+from\s+["']node:path["'];?\n?/g,
    'import path from "@reliverse/dler-pathkit";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*path[^}]*\}\s+from\s+["']node:path["'];?\n?/g,
    'import path from "@reliverse/dler-pathkit";\n',
  );

  // Replace tinyglobby imports with Bun's Glob
  transformed = transformed.replace(
    /import\s+\{[^}]*glob[^}]*\}\s+from\s+["']tinyglobby["'];?\n?/g,
    'import { Glob } from "bun";\n',
  );

  // Remove isCancel imports
  transformed = transformed.replace(
    /import\s+\{[^}]*isCancel[^}]*\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    "",
  );

  // Remove @orpc/server imports
  transformed = transformed.replace(
    /import\s+.*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*createRouterClient[^}]*\}\s*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*os[^}]*\}\s*from\s+["']@orpc\/server["'];?\n?/g,
    "",
  );

  // Remove trpc-cli imports
  transformed = transformed.replace(
    /import\s+.*from\s+["']trpc-cli["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*createCli[^}]*\}\s*from\s+["']trpc-cli["'];?\n?/g,
    "",
  );

  // Remove unused better-auth imports
  transformed = transformed.replace(
    /import\s*\{[^}]*reactStartCookies[^}]*\}\s*from\s+["']better-auth\/react-start["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*nextCookies[^}]*\}\s*from\s+["']better-auth\/next-js["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s*\{[^}]*expo[^}]*\}\s*from\s+["']@better-auth\/expo["'];?\n?/g,
    "",
  );

  // Remove @opennextjs/cloudflare imports
  transformed = transformed.replace(
    /import\s*\{[^}]*defineCloudflareConfig[^}]*\}\s*from\s+["']@opennextjs\/cloudflare["'];?\n?/g,
    "",
  );
  transformed = transformed.replace(
    /import\s+.*from\s+["']@opennextjs\/cloudflare["'];?\n?/g,
    "",
  );

  // Replace clack/prompts usage with logger
  transformed = transformed.replace(/\bintro\(/g, "logger.info(");
  transformed = transformed.replace(
    /\blog\.(success|info|warn|error)\(/g,
    "logger.$1(",
  );
  transformed = transformed.replace(/\blog\.message\(/g, "logger.log(");
  transformed = transformed.replace(/\boutro\(/g, "logger.info(");
  // Transform exitCancelled helper to new behavior
  transformed = transformed.replace(
    /export\s+function\s+exitCancelled\(\s*message\s*=\s*"Operation cancelled"\s*\)\s*:\s*never\s*\{([\s\S]*?process\.exit\(0\);\s*)\}/gs,
    (match, body) => {
      if (!body.includes("cancel(") || body.includes("PromptCancelledError")) {
        return match;
      }
      const indentMatch = match.match(/^\s*/);
      const indent = indentMatch?.[0] ?? "";
      const inner = `${indent}\t`;
      const innerDeep = `${inner}\t`;
      return `${indent}export function exitCancelled(message = "Operation cancelled"): never {\n${inner}if (isProgrammatic()) {\n${innerDeep}throw new PromptCancelledError(message);\n${inner}}\n\n${inner}console.log(re.red(message));\n${inner}process.exit(0);\n${indent}}`;
    },
  );
  if (
    transformed.includes("PromptCancelledError") &&
    !/import\s+[^;]*PromptCancelledError[^;]*from\s+["']@reliverse\/dler-prompt["'];?/.test(
      transformed,
    )
  ) {
    transformed = `import { PromptCancelledError } from "@reliverse/dler-prompt";\n${transformed}`;
  }
  // Replace spinner() calls with createSpinner()
  transformed = transformed.replace(/\bspinner\(/g, "createSpinner(");
  // Replace select() calls with selectPrompt()
  // Handle both select(...) and select<Type>(...) - keep generics as selectPrompt now supports them
  transformed = transformed.replace(
    /\bselect(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic ? `selectPrompt${generic}(` : "selectPrompt(";
    },
  );
  // Replace multiselect() calls with multiselectPrompt()
  // Handle both multiselect(...) and multiselect<Type>(...) - keep generics as multiselectPrompt now supports them
  transformed = transformed.replace(
    /\bmultiselect(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic ? `multiselectPrompt${generic}(` : "multiselectPrompt(";
    },
  );
  // Replace autocompleteMultiselect() calls with multiselectPrompt()
  // Handle both autocompleteMultiselect(...) and autocompleteMultiselect<Type>(...)
  transformed = transformed.replace(
    /\bautocompleteMultiselect(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic ? `multiselectPrompt${generic}(` : "multiselectPrompt(";
    },
  );
  // Replace autocompleteMultiselect in any other import statements (non-@clack/prompts)
  transformed = transformed.replace(
    /import\s+\{([^}]*autocompleteMultiselect[^}]*)\}\s+from\s+["'][^"']+["'];?\n?/g,
    (match) => {
      return match.replace(/\bautocompleteMultiselect\b/g, "multiselectPrompt");
    },
  );
  // Replace any remaining references to autocompleteMultiselect
  transformed = transformed.replace(
    /\bautocompleteMultiselect\b/g,
    "multiselectPrompt",
  );
  // Replace confirm in any other import statements (non-@clack/prompts)
  transformed = transformed.replace(
    /import\s+\{([^}]*\bconfirm\b[^}]*)\}\s+from\s+["'][^"']+["'];?\n?/g,
    (match) => {
      return match.replace(/\bconfirm\b/g, "confirmPrompt");
    },
  );
  // Replace group() calls with groupPrompt()
  transformed = transformed.replace(
    /\bgroup(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic ? `groupPrompt${generic}(` : "groupPrompt(";
    },
  );
  // Replace groupMultiselect() calls with groupMultiselectPrompt()
  // Handle both groupMultiselect(...) and groupMultiselect<Type>(...)
  transformed = transformed.replace(
    /\bgroupMultiselect(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic
        ? `groupMultiselectPrompt${generic}(`
        : "groupMultiselectPrompt(";
    },
  );
  // Replace groupMultiselect in any other import statements (non-@clack/prompts)
  transformed = transformed.replace(
    /import\s+\{([^}]*groupMultiselect[^}]*)\}\s+from\s+["'][^"']+["'];?\n?/g,
    (match) => {
      return match.replace(/\bgroupMultiselect\b/g, "groupMultiselectPrompt");
    },
  );
  // Replace any remaining references to groupMultiselect
  transformed = transformed.replace(
    /\bgroupMultiselect\b/g,
    "groupMultiselectPrompt",
  );
  // Replace text() calls with inputPrompt()
  // Handle both text(...) and text<Type>(...) - remove generics as inputPrompt doesn't support them
  // Be careful not to match .text() which is a method on Bun's $ template literals
  transformed = transformed.replace(/\btext(<[^>]*>)?\(/g, () => {
    return "inputPrompt(";
  });
  // Replace confirm() calls with confirmPrompt()
  // Handle both confirm(...) and confirm<Type>(...) - keep generics as confirmPrompt now supports them
  transformed = transformed.replace(
    /\bconfirm(<[^>]*>)?\(/g,
    (_match, generic) => {
      return generic ? `confirmPrompt${generic}(` : "confirmPrompt(";
    },
  );
  // Keep hint as is (dler-prompt now uses hint instead of description)
  // Replace initialValues (plural) with initialValue (singular)
  transformed = transformed.replace(/\binitialValues\b/g, "initialValue");

  // Remove initialValue property (multiselectPrompt doesn't support it)
  // This handles multiline expressions by finding balanced parentheses/brackets/braces
  // We need to find and remove: [optional comma/whitespace]initialValue: [entire value expression][comma or closing brace]
  const initialValueRegex = /\binitialValue\s*:/g;
  let match: RegExpExecArray | null;
  const parts: string[] = [];
  let lastIndex = 0;
  let foundAny = false;

  // biome-ignore lint/suspicious/noAssignInExpressions: needed for regex exec loop
  while ((match = initialValueRegex.exec(transformed)) !== null) {
    foundAny = true;
    const matchStart = match.index;
    const beforeMatch = transformed.slice(lastIndex, matchStart);

    // Check if there's a comma before this property
    const beforeText = beforeMatch.trimEnd();
    const hasCommaBefore = beforeText.endsWith(",");

    // Find where the value expression ends by tracking nesting
    let depth = 0;
    let inString = false;
    let stringChar = "";
    let i = matchStart + match[0].length;
    let endPos = transformed.length;

    while (i < transformed.length) {
      const char = transformed[i];
      const prevChar = i > 0 ? transformed[i - 1] : "";

      if (!inString && (char === '"' || char === "'" || char === "`")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== "\\") {
        inString = false;
      } else if (!inString) {
        if (char === "(" || char === "[" || char === "{") {
          depth++;
        } else if (char === ")" || char === "]" || char === "}") {
          depth--;
          if (depth < 0) {
            endPos = i;
            break;
          }
        } else if (depth === 0 && char === ",") {
          endPos = i;
          break;
          // biome-ignore lint/suspicious/noDuplicateElseIf: <>
        } else if (depth === 0 && (char === "}" || char === "]")) {
          endPos = i;
          break;
        }
      }
      i++;
    }

    // Add the text before the property (without the comma if it was before initialValue)
    if (hasCommaBefore) {
      const commaIndex = beforeMatch.lastIndexOf(",");
      parts.push(beforeMatch.slice(0, commaIndex));
    } else {
      parts.push(beforeMatch);
    }

    // Skip the property and its value, update lastIndex
    lastIndex = endPos;
  }

  // Only reconstruct if we found any matches
  if (foundAny) {
    // Add the remaining text
    if (lastIndex < transformed.length) {
      parts.push(transformed.slice(lastIndex));
    }
    // Reconstruct without initialValue properties
    transformed = parts.join("");
  }

  // Clean up leftover commas and whitespace
  transformed = transformed.replace(/,\s*,/g, ",");
  transformed = transformed.replace(/,\s*\n\s*\}/g, "\n}");
  transformed = transformed.replace(/{\s*,/g, "{");
  transformed = transformed.replace(/\n\s*\n\s*\n/g, "\n\n");
  // Remove placeholder property (inputPrompt doesn't support it)
  // Handle: , placeholder: "value" or , placeholder: value
  transformed = transformed.replace(
    /,\s*placeholder\s*:\s*(?:"[^"]*"|'[^']*'|[^,}\]]+)\s*/g,
    "",
  );
  // Handle: placeholder: "value", or placeholder: value (at start or end)
  transformed = transformed.replace(
    /\bplaceholder\s*:\s*(?:"[^"]*"|'[^']*'|[^,}\]]+)\s*,?\s*/g,
    "",
  );
  // Add optional chaining-safe array access for fixed indices
  // Handle both property access (arr[0].prop) and method calls (arr[0].method())
  transformed = transformed.replace(
    /(\b[A-Za-z_$][\w$]*)\[(\d+)\]\.([A-Za-z_$][\w$]*)(\(\))?/g,
    (_match, arrayName, index, member, isMethod) => {
      if (isMethod) {
        // Method call: arr[0].method() -> arr.at(0)?.method()
        return `${arrayName}.at(${index})?.${member}()`;
      }
      // Property access: arr[0].prop -> arr.at(0)?.prop
      return `${arrayName}.at(${index})?.${member}`;
    },
  );
  // Add nullish coalescing fallback for optional chained array property/method access when no fallback exists
  // Handle both property access and method calls correctly
  // Skip if already has nullish coalescing
  transformed = transformed.replace(
    /(\b[A-Za-z_$][\w$]*\.at\(\d+\)\?\.[A-Za-z_$][\w$]*(?:\(\))?)(?!\s*\?\?)/g,
    (match, expression, offset, fullString) => {
      // Check if already wrapped in parentheses (check before the match)
      const beforeMatch = fullString.slice(Math.max(0, offset - 20), offset);
      if (beforeMatch.trim().endsWith("(")) {
        return match;
      }

      // Wrap the entire expression (including method call if present) with nullish coalescing
      return `(${expression}) ?? ""`;
    },
  );

  // Fix array index access [0] to use .at(0) with proper null handling
  // Pattern: array[0].property -> array.at(0)?.property (but only when used in contexts that need it)
  // This is more conservative - only transform when it's clear the result needs null handling
  transformed = transformed.replace(
    /(\b[A-Za-z_$][\w$]*)\[0\]\.([A-Za-z_$][\w$]*)/g,
    (_match, arrayName, property) => {
      return `${arrayName}.at(0)?.${property}`;
    },
  );

  // Fix array index access in includes() calls: array[0] -> array.at(0) with type assertion
  // Pattern: FULLSTACK_FRONTENDS.includes(web[0]) -> FULLSTACK_FRONTENDS.includes((web.at(0) ?? "") as typeof web[number])
  // But skip ?? "" if there's a length check before (e.g., web.length === 1 && ...)
  transformed = transformed.replace(
    /(\w+)\.includes\s*\(\s*(\w+)\[0\]\s*\)/g,
    (_match, arrayName, indexArrayName, offset, fullString) => {
      // Check if there's a length check before this expression
      const beforeMatch = fullString.slice(Math.max(0, offset - 100), offset);
      const hasLengthCheck = new RegExp(
        `\\b${indexArrayName}\\.length\\s*===\\s*1`,
      ).test(beforeMatch);

      if (hasLengthCheck) {
        // Don't add ?? "" if length is checked
        return `${arrayName}.includes(${indexArrayName}.at(0) as typeof ${indexArrayName}[number])`;
      }
      return `${arrayName}.includes((${indexArrayName}.at(0) ?? "") as typeof ${indexArrayName}[number])`;
    },
  );

  // Transform tinyglobby glob() calls to Bun's Glob
  // Pattern: await glob(pattern, options) -> await (async () => { ... })()
  transformed = transformed.replace(
    /await\s+glob\s*\(([^,]+),\s*(\{(?:[^{}]|\{[^{}]*\})*\})\)/gs,
    (_match, patternArg, optionsArg) => {
      // Extract options
      const options = optionsArg.trim();
      const ignoreMatch = options.match(/ignore\s*:\s*([^,}]+)/);
      const hasIgnore = ignoreMatch !== null;
      const ignoreValue = ignoreMatch?.[1]?.trim() || "[]";

      // Build scan options (remove ignore from options)
      let scanOptions = options;
      if (hasIgnore) {
        // Remove ignore property with proper handling
        scanOptions = scanOptions
          .replace(/,\s*ignore\s*:\s*[^,}]+/g, "")
          .replace(/ignore\s*:\s*[^,}]+,\s*/g, "")
          .replace(/ignore\s*:\s*[^,}]+/g, "")
          .replace(/,\s*,/g, ",") // Clean up double commas
          .replace(/,\s*\}/g, "}") // Clean up trailing commas
          .replace(/\{\s*,/g, "{"); // Clean up leading commas
      }

      // Handle pattern (can be string or array)
      const pattern = patternArg.trim();
      const isArrayPattern = pattern.startsWith("[");
      const isVariablePattern = /^[a-zA-Z_$][\w$]*$/.test(pattern);

      if (isArrayPattern) {
        // Array of patterns - need to handle multiple globs
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `await (async () => {
			const patterns = ${pattern};
			const allFiles = new Set<string>();
			for (const pattern of patterns) {
				const glob = new Glob(pattern);
				for await (const file of glob.scan(${scanOptions || "{}"})) {
					allFiles.add(file);
				}
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = (${ignoreVarName} ?? []).map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue} ?? [];
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return Array.from(allFiles);"
      }
		})()`;
      } else if (isVariablePattern) {
        // Variable that could be string | string[] - handle both cases
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `await (async () => {
			const patterns = Array.isArray(${pattern}) ? ${pattern} : [${pattern}];
			const allFiles = new Set<string>();
			for (const pattern of patterns) {
				const glob = new Glob(pattern);
				for await (const file of glob.scan(${scanOptions || "{}"})) {
					allFiles.add(file);
				}
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = (${ignoreVarName} ?? []).map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue} ?? [];
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return Array.from(allFiles);"
      }
		})()`;
      } else {
        // Single pattern (string literal)
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `await (async () => {
			const glob = new Glob(${pattern});
			const files: string[] = [];
			for await (const file of glob.scan(${scanOptions || "{}"})) {
				files.push(file);
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return files.filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue};
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return files.filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return files;"
      }
		})()`;
      }
    },
  );
  // Also handle non-await glob calls
  transformed = transformed.replace(
    /(\bconst\s+\w+\s*=\s*)glob\s*\(([^,]+),\s*(\{(?:[^{}]|\{[^{}]*\})*\})\)/gs,
    (_match, prefix, patternArg, optionsArg) => {
      const options = optionsArg.trim();
      const ignoreMatch = options.match(/ignore\s*:\s*([^,}]+)/);
      const hasIgnore = ignoreMatch !== null;
      const ignoreValue = ignoreMatch?.[1]?.trim() || "[]";
      let scanOptions = options;
      if (hasIgnore) {
        scanOptions = scanOptions
          .replace(/,\s*ignore\s*:\s*[^,}]+/g, "")
          .replace(/ignore\s*:\s*[^,}]+,\s*/g, "")
          .replace(/ignore\s*:\s*[^,}]+/g, "")
          .replace(/,\s*,/g, ",")
          .replace(/,\s*\}/g, "}")
          .replace(/\{\s*,/g, "{");
      }
      const pattern = patternArg.trim();
      const isArrayPattern = pattern.startsWith("[");
      const isVariablePattern = /^[a-zA-Z_$][\w$]*$/.test(pattern);

      if (isArrayPattern) {
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `${prefix}(async () => {
			const patterns = ${pattern};
			const allFiles = new Set<string>();
			for (const pattern of patterns) {
				const glob = new Glob(pattern);
				for await (const file of glob.scan(${scanOptions || "{}"})) {
					allFiles.add(file);
				}
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = (${ignoreVarName} ?? []).map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue} ?? [];
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return Array.from(allFiles);"
      }
		})()`;
      } else if (isVariablePattern) {
        // Variable that could be string | string[] - handle both cases
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `${prefix}(async () => {
			const patterns = Array.isArray(${pattern}) ? ${pattern} : [${pattern}];
			const allFiles = new Set<string>();
			for (const pattern of patterns) {
				const glob = new Glob(pattern);
				for await (const file of glob.scan(${scanOptions || "{}"})) {
					allFiles.add(file);
				}
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = (${ignoreVarName} ?? []).map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue} ?? [];
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return Array.from(allFiles).filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return Array.from(allFiles);"
      }
		})()`;
      } else {
        // Check if ignoreValue is a variable name (not an array literal)
        const isIgnoreVariable = /^[a-zA-Z_$][\w$]*$/.test(ignoreValue);
        const ignoreVarName = isIgnoreVariable ? ignoreValue : "ignorePatterns";

        return `${prefix}(async () => {
			const glob = new Glob(${pattern});
			const files: string[] = [];
			for await (const file of glob.scan(${scanOptions || "{}"})) {
				files.push(file);
			}
			${
        hasIgnore
          ? isIgnoreVariable
            ? `const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return files.filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
            : `const ${ignoreVarName} = ${ignoreValue};
			const ignoreGlobs = ${ignoreVarName}.map((p: string) => new Glob(p));
			return files.filter((file) => {
				return !ignoreGlobs.some((ignoreGlob) => ignoreGlob.match(file));
			});`
          : "return files;"
      }
		})()`;
      }
    },
  );
  // Normalize workspaces to always be an array when used with .includes() or .push()
  // Pattern: const workspaces = packageJson.workspaces; followed by workspaces.includes() or workspaces.push()
  transformed = transformed.replace(
    /(const\s+workspaces\s*=\s*(\w+)\.workspaces;)([\s\S]*?)(workspaces\.(includes|push))/gs,
    (_match, _assignment, objectName, between, usage) => {
      // Only transform if workspaces is used with .includes() or .push() after the assignment
      return `const workspaces = Array.isArray(${objectName}.workspaces) 
		? ${objectName}.workspaces 
		: ${objectName}.workspaces?.packages ?? [];${between}${usage}`;
    },
  );

  // Fix workspaces.catalog access by adding type assertion
  // Pattern: workspaces.catalog -> (workspaces as { catalog?: Record<string, string> }).catalog
  transformed = transformed.replace(
    /(\w+\.workspaces)\.catalog/g,
    (_match, workspacesExpr) => {
      return `(${workspacesExpr} as { catalog?: Record<string, string>; packages?: string[]; nohoist?: string[] }).catalog`;
    },
  );

  // Fix workspaces object assignment with catalog property
  // Pattern: workspaces = { packages: ..., catalog } -> workspaces = { packages: ..., catalog } as { packages?: string[]; catalog?: Record<string, string>; nohoist?: string[] }
  // Strategy: Use a helper function to properly match balanced braces, then add type assertion
  // First, try to match the pattern more directly with a balanced brace approach
  const workspacesCatalogPattern =
    /(\w+\.workspaces)\s*=\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*packages(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*catalog(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})\s*;/gs;

  transformed = transformed.replace(
    workspacesCatalogPattern,
    (_match, workspacesExpr, objectLiteral) => {
      // Verify it contains both packages and catalog
      if (
        objectLiteral.includes("packages") &&
        objectLiteral.includes("catalog")
      ) {
        // Count braces to ensure we have a complete object literal
        const openBraces = (objectLiteral.match(/\{/g) || []).length;
        const closeBraces = (objectLiteral.match(/\}/g) || []).length;
        if (openBraces === closeBraces && openBraces > 0) {
          return `${workspacesExpr} = ${objectLiteral} as { packages?: string[]; catalog?: Record<string, string>; nohoist?: string[] };`;
        }
      }
      return _match;
    },
  );

  // Simpler fallback: match multiline pattern with newline handling
  // Pattern: workspaces = {\n\tpackages: ...,\n\tcatalog,\n};
  transformed = transformed.replace(
    /(\w+\.workspaces)\s*=\s*\{([\s\S]*?packages[\s\S]*?catalog[\s\S]*?)\}\s*;/g,
    (_match, workspacesExpr, objectBody) => {
      // Reconstruct the object with type assertion
      return `${workspacesExpr} = {${objectBody}} as { packages?: string[]; catalog?: Record<string, string>; nohoist?: string[] };`;
    },
  );

  // Fix Record<string, T> property access that TypeScript thinks might be undefined
  // Pattern: deps.web.dependencies -> deps.web!.dependencies
  // Only apply when accessing a property on a Record that's immediately followed by another property access
  transformed = transformed.replace(
    /(\w+)\.(\w+)\.(\w+)/g,
    (match, objName, firstProp, secondProp, offset, fullString) => {
      // Check if objName is declared as Record<string, ...> in the same function/scope
      const beforeMatch = fullString.slice(Math.max(0, offset - 500), offset);

      // Case 1: Direct Record declaration: const objName: Record<string, T> = { ... }
      const recordPattern = new RegExp(
        `const\\s+${objName}\\s*:\\s*Record<string,\\s*[^>]+>`,
      );
      const objLiteralPattern = new RegExp(
        `${objName}\\s*:\\s*Record<string,[^>]+>\\s*=\\s*\\{([\\s\\S]*?)\\};`,
      );

      if (recordPattern.test(beforeMatch)) {
        const objMatch = beforeMatch.match(objLiteralPattern);
        if (objMatch?.[1]?.includes(`${firstProp}:`)) {
          // The property exists in the object literal, add non-null assertion
          return `${objName}.${firstProp}!.${secondProp}`;
        }
      }

      // Case 2: Variable assigned from function that returns Record
      // Pattern: const objName = functionName(...); where functionName returns Record<string, T>
      const assignmentPattern = new RegExp(
        `const\\s+${objName}\\s*=\\s*([\\w]+)\\([^)]*\\);`,
      );
      const assignmentMatch = beforeMatch.match(assignmentPattern);
      if (assignmentMatch) {
        const funcName = assignmentMatch[1];
        // Look for the function definition that returns Record
        const funcPattern = new RegExp(
          `function\\s+${funcName}[^{]*\\{[\\s\\S]*?const\\s+\\w+\\s*:\\s*Record<string,[^>]+>\\s*=\\s*\\{([\\s\\S]*?)\\};`,
        );
        const funcMatch = fullString.match(funcPattern);
        if (funcMatch?.[1]?.includes(`${firstProp}:`)) {
          // The property exists in the returned Record, add non-null assertion
          return `${objName}.${firstProp}!.${secondProp}`;
        }
      }

      return match;
    },
  );

  // Fix string split operations that can return undefined
  // Pattern: importStatement.split('"')[1] -> importStatement.split('"')[1] ?? ""
  // Fix when used in .includes() calls
  transformed = transformed.replace(
    /\.includes\((\w+)\.split\(([^)]+)\)\[(\d+)\]\)/g,
    (_match, varName, splitArg, index) => {
      return `.includes((${varName}.split(${splitArg})[${index}] ?? ""))`;
    },
  );

  // Fix when used in moduleSpecifier property
  transformed = transformed.replace(
    /moduleSpecifier:\s*(\w+)\.split\(([^)]+)\)\[(\d+)\]/g,
    (_match, varName, splitArg, index) => {
      return `moduleSpecifier: ${varName}.split(${splitArg})[${index}] ?? ""`;
    },
  );

  // Fix chained split operations: str.split("{")[1].split("}")[0]
  // Pattern: importStatement.split("{")[1].split("}")[0] -> (importStatement.split("{")[1]?.split("}")[0]) ?? ""
  transformed = transformed.replace(
    /namedImports:\s*\[(\w+)\.split\(([^)]+)\)\[(\d+)\]\.split\(([^)]+)\)\[(\d+)\]/g,
    (_match, varName, firstSplit, firstIndex, secondSplit, secondIndex) => {
      return `namedImports: [(${varName}.split(${firstSplit})[${firstIndex}]?.split(${secondSplit})[${secondIndex}]) ?? ""`;
    },
  );

  // Fix selection options to ensure value is never undefined
  // Pattern: value: group.name -> value: group.name ?? ""
  // When used in map functions that create selection options
  transformed = transformed.replace(
    /value:\s*(\w+)\.(\w+)(?=\s*,)/g,
    (_match, itemName, propName) => {
      // Only apply if this is in a context that looks like selection options
      // Check if we're inside a map function
      return `value: ${itemName}.${propName} ?? ""`;
    },
  );

  // Fix groupedOptions.Linting.push and groupedOptions.Other.push
  // Pattern: groupedOptions.Linting.push -> groupedOptions.Linting!.push
  // Pattern: groupedOptions.Other.push -> groupedOptions.Other!.push
  transformed = transformed.replace(
    /(groupedOptions\.(?:Linting|Other))\.push/g,
    "$1!.push",
  );

  // Fix groupedOptions[group].length access
  // Pattern: groupedOptions[group].length -> groupedOptions[group]?.length
  transformed = transformed.replace(
    /(groupedOptions\[group\])\.length/g,
    "$1?.length",
  );

  // Add groupMultiselectPrompt import if groupMultiselectPrompt() is used
  // Check for usage with or without generics
  const hasGroupMultiselectPrompt =
    /\bgroupMultiselectPrompt\s*(<[^>]*>)?\s*\(/.test(transformed);
  const hasGroupMultiselectPromptImport =
    /import\s+[^;]*groupMultiselectPrompt[^;]*from\s+["']@reliverse\/dler-prompt["'];?/.test(
      transformed,
    );

  if (hasGroupMultiselectPrompt && !hasGroupMultiselectPromptImport) {
    // Check if there's already an import from @reliverse/dler-prompt
    const promptImportRegex =
      /import\s+\{([^}]*)\}\s+from\s+["']@reliverse\/dler-prompt["'];?\n?/;
    const promptImportMatch = transformed.match(promptImportRegex);

    if (promptImportMatch?.[1]) {
      // Add groupMultiselectPrompt to existing import
      const existingImports = promptImportMatch[1]
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i && i !== "groupMultiselectPrompt" && i !== "type");
      // Sort imports for consistency
      existingImports.push("groupMultiselectPrompt");
      const sortedImports = existingImports.sort();
      transformed = transformed.replace(
        promptImportMatch[0],
        `import { ${sortedImports.join(", ")} } from "@reliverse/dler-prompt";\n`,
      );
    } else {
      // Add new import - find the first import line
      const firstImportMatch = transformed.match(
        /^import\s+.*from\s+["'][^"']+["'];?\n?/m,
      );
      if (firstImportMatch) {
        transformed = transformed.replace(
          firstImportMatch[0],
          `import { groupMultiselectPrompt } from "@reliverse/dler-prompt";\n${firstImportMatch[0]}`,
        );
      } else {
        // No imports at all, add at the beginning
        transformed = `import { groupMultiselectPrompt } from "@reliverse/dler-prompt";\n${transformed}`;
      }
    }
  }

  // Add cancel import if cancel() is used
  if (
    /\bcancel\s*\(/.test(transformed) &&
    !/import\s+[^;]*cancel[^;]*from\s+["']@reliverse\/dler-prompt["'];?/.test(
      transformed,
    )
  ) {
    // Check if there's already an import from @reliverse/dler-prompt
    const promptImportMatch = transformed.match(
      /import\s+\{([^}]*)\}\s+from\s+["']@reliverse\/dler-prompt["'];?\n?/,
    );
    if (promptImportMatch?.[1]) {
      // Add cancel to existing import
      const existingImports = promptImportMatch[1]
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i && i !== "cancel");
      existingImports.push("cancel");
      transformed = transformed.replace(
        promptImportMatch[0],
        `import { ${existingImports.join(", ")} } from "@reliverse/dler-prompt";\n`,
      );
    } else {
      // Add new import
      const firstImportMatch = transformed.match(
        /^import\s+.*from\s+["'][^"']+["'];?\n?/m,
      );
      if (firstImportMatch) {
        transformed = transformed.replace(
          firstImportMatch[0],
          `import { cancel } from "@reliverse/dler-prompt";\n${firstImportMatch[0]}`,
        );
      } else {
        transformed = `import { cancel } from "@reliverse/dler-prompt";\n${transformed}`;
      }
    }
  }

  // Remove required: false from multiselectPrompt calls
  // Handle cases where required: false is on its own line with comma before it
  transformed = transformed.replace(
    /,\s*\n\s*required\s*:\s*false\s*,?\s*\n/g,
    ",\n",
  );
  // Handle cases where required: false is on the same line with comma before it
  transformed = transformed.replace(
    /,\s*required\s*:\s*false\s*,?\s*(?=\n)/g,
    ",",
  );
  // Handle cases where required: false is at the end (before closing brace)
  transformed = transformed.replace(
    /,\s*required\s*:\s*false\s*(?=\s*\})/g,
    "",
  );
  transformed = transformed.replace(
    /required\s*:\s*false\s*,\s*(?=\s*\})/g,
    "",
  );
  // Handle standalone required: false on its own line (without comma before it, at start)
  transformed = transformed.replace(
    /\n\s*required\s*:\s*false\s*,?\s*\n/g,
    "\n",
  );

  // Keep isCancel checks and exitCancelled calls (they're now supported by dler-prompt)
  // Transform isCancel and exitCancelled imports from @clack/prompts to @reliverse/dler-prompt
  transformed = transformed.replace(
    /import\s+\{\s*isCancel\s*\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    'import { isCancel } from "@reliverse/dler-prompt";\n',
  );
  transformed = transformed.replace(
    /import\s+\{\s*exitCancelled\s*\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    'import { exitCancelled } from "@reliverse/dler-prompt";\n',
  );
  transformed = transformed.replace(
    /import\s+\{\s*([^}]*isCancel[^}]*)\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    (_match, imports) => {
      const importList = imports.split(",").map((i: string) => i.trim());
      const promptImports = importList.filter(
        (i: string) => i === "isCancel" || i === "exitCancelled",
      );
      const otherImports = importList.filter(
        (i: string) => i !== "isCancel" && i !== "exitCancelled",
      );
      const result: string[] = [];
      if (promptImports.length > 0) {
        result.push(
          `import { ${promptImports.join(", ")} } from "@reliverse/dler-prompt";`,
        );
      }
      if (otherImports.length > 0) {
        result.push(
          `import { ${otherImports.join(", ")} } from "@reliverse/dler-logger";`,
        );
      }
      return `${result.join("\n")}\n`;
    },
  );

  // Replace consola usage with logger
  transformed = transformed.replace(
    /\bconsola\.(success|info|warn|error|log|fatal)\(/g,
    "logger.$1(",
  );
  transformed = transformed.replace(/\bconsola\.box\(/g, "logger.box(");
  transformed = transformed.replace(/\bconsola\b/g, "logger");

  // Replace picocolors usage
  transformed = transformed.replace(/\bpc\./g, "re.");
  transformed = transformed.replace(/\bpc\b/g, "re");

  // Track if we need to add pkg-tsc imports (check before transforming)
  const needsPkgTsc = /fs\.readJson\(|fs\.writeJson\(/.test(transformed);

  // Transform fs.readJson() to readPackageJSON()
  // Pattern: await fs.readJson(path) -> await readPackageJSON(path.dirname(path))
  transformed = transformed.replace(
    /await\s+fs\.readJson\(([^)]+)\)/g,
    (_match, pathArg) => {
      // Extract the path variable/expression
      const trimmedPath = pathArg.trim();
      // Use path.dirname() to get directory from file path
      return `await readPackageJSON(path.dirname(${trimmedPath}))`;
    },
  );
  // Also handle non-await cases
  transformed = transformed.replace(
    /fs\.readJson\(([^)]+)\)/g,
    (_match, pathArg) => {
      const trimmedPath = pathArg.trim();
      return `readPackageJSON(path.dirname(${trimmedPath}))`;
    },
  );

  // Transform fs.readJSONSync() to fs.readJSONSync() with type assertion
  // Pattern: fs.readJSONSync(path) -> fs.readJSONSync(path) as { version?: string; [key: string]: unknown }
  transformed = transformed.replace(
    /(\w+)\s*=\s*fs\.readJSONSync\(([^)]+)\)/g,
    (_match, varName, pathArg) => {
      return `${varName} = fs.readJSONSync(${pathArg}) as { version?: string; [key: string]: unknown }`;
    },
  );

  // Transform fs.writeJson() to writePackageJSON()
  // Pattern: await fs.writeJson(path, data, options) -> await writePackageJSON(path.dirname(path), data)
  // Note: writePackageJSON doesn't accept options parameter
  transformed = transformed.replace(
    /await\s+fs\.writeJson\(([^)]+)\)/g,
    (_match, args) => {
      // Parse arguments: path, data, options (options will be ignored)
      const argParts = args.split(",").map((a: string) => a.trim());
      if (argParts.length >= 2) {
        const pathArg = argParts[0];
        const dataArg = argParts[1];
        // Only pass path and data, ignore options
        return `await writePackageJSON(path.dirname(${pathArg}), ${dataArg})`;
      }
      return _match; // Fallback if pattern doesn't match
    },
  );
  // Also handle non-await cases
  transformed = transformed.replace(
    /fs\.writeJson\(([^)]+)\)/g,
    (_match, args) => {
      const argParts = args.split(",").map((a: string) => a.trim());
      if (argParts.length >= 2) {
        const pathArg = argParts[0];
        const dataArg = argParts[1];
        // Only pass path and data, ignore options
        return `writePackageJSON(path.dirname(${pathArg}), ${dataArg})`;
      }
      return _match;
    },
  );

  // Add pkg-tsc imports if needed
  if (needsPkgTsc) {
    // Check if import already exists
    if (!/@reliverse\/dler-pkg-tsc/.test(transformed)) {
      // Add import after other imports (we'll deduplicate later)
      transformed = transformed.replace(
        /(import\s+.*from\s+["']@reliverse\/pathkit["'];?\n?)/,
        '$1import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";\n',
      );
      // If pathkit import doesn't exist, add both
      if (!/@reliverse\/pathkit/.test(transformed)) {
        // Add at the beginning of imports section
        const firstImportMatch = transformed.match(
          /^import\s+.*from\s+["'][^"']+["'];?\n?/m,
        );
        if (firstImportMatch) {
          transformed = transformed.replace(
            firstImportMatch[0],
            `import path from "@reliverse/dler-pathkit";\nimport { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";\n${firstImportMatch[0]}`,
          );
        } else {
          // No imports found, add at the top
          transformed = `import path from "@reliverse/dler-pathkit";\nimport { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";\n${transformed}`;
        }
      }
    } else {
      // Import exists, check if we need to add readPackageJSON/writePackageJSON
      if (!/readPackageJSON/.test(transformed)) {
        transformed = transformed.replace(
          /(import\s+\{[^}]*\}\s+from\s+["']@reliverse\/dler-pkg-tsc["'];?\n?)/,
          (match) => {
            // Extract existing imports
            const existingMatch = match.match(/\{([^}]*)\}/)?.[1];
            if (existingMatch) {
              const existingImports = existingMatch
                .split(",")
                .map((i) => i.trim());
              const newImports = [
                ...existingImports,
                "readPackageJSON",
                "writePackageJSON",
              ]
                .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
                .sort();
              return `import { ${newImports.join(", ")} } from "@reliverse/dler-pkg-tsc";\n`;
            }
            return match;
          },
        );
      }
    }
  }

  // Fix incorrect transformations: revert { encoding: variable } back to just variable
  // This fixes cases where variables were incorrectly transformed (e.g., directory names)
  // First, fix cases where { encoding: variable } appears in path.resolve or other path functions
  transformed = transformed.replace(
    /(path\.(?:resolve|join|dirname|basename))\s*\(\s*([^,]+)\s*,\s*\{\s*encoding\s*:\s*([a-zA-Z_$][\w$]*)\s*\}\s*\)/g,
    (_match, pathFunc, firstArg, varName) => {
      // This is clearly wrong - path functions don't take encoding options
      return `${pathFunc}(${firstArg}, ${varName})`;
    },
  );

  // Fix readdir calls with incorrect variable transformations
  transformed = transformed.replace(
    /\bfs\.readdir\s*\(\s*([^,]+)\s*,\s*\{\s*encoding\s*:\s*([a-zA-Z_$][\w$]*)\s*\}\s*\)/g,
    (_match, pathArg, varName) => {
      // Only revert if the variable name doesn't look like an encoding
      const encodingPattern =
        /^(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary|encoding|enc|charset)$/i;
      if (encodingPattern.test(varName)) {
        return _match; // Keep the transformation if it looks like an encoding
      }
      return `fs.readdir(${pathArg}, ${varName})`;
    },
  );
  transformed = transformed.replace(
    /(?<!\.)\breaddir\s*\(\s*([^,]+)\s*,\s*\{\s*encoding\s*:\s*([a-zA-Z_$][\w$]*)\s*\}\s*\)/g,
    (_match, pathArg, varName) => {
      const encodingPattern =
        /^(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary|encoding|enc|charset)$/i;
      if (encodingPattern.test(varName)) {
        return _match;
      }
      return `readdir(${pathArg}, ${varName})`;
    },
  );

  // Transform fs operations to use options object
  // Pattern: fs.readFile(path, "utf8") -> fs.readFile(path, { encoding: "utf8" })
  // Only transform string literals that look like encodings to avoid false positives
  transformed = transformed.replace(
    /\bfs\.readFile\s*\(\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\2\s*\)/gi,
    (_match, pathArg, quote, encoding) => {
      return `fs.readFile(${pathArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: fs.writeFile(path, data, "utf8") -> fs.writeFile(path, data, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  transformed = transformed.replace(
    /\bfs\.writeFile\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\3\s*\)/gi,
    (_match, pathArg, dataArg, quote, encoding) => {
      return `fs.writeFile(${pathArg}, ${dataArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: fs.appendFile(path, data, "utf8") -> fs.appendFile(path, data, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  transformed = transformed.replace(
    /\bfs\.appendFile\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\3\s*\)/gi,
    (_match, pathArg, dataArg, quote, encoding) => {
      return `fs.appendFile(${pathArg}, ${dataArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: fs.readdir(path, "utf8") -> fs.readdir(path, { encoding: "utf8" })
  // Only transform string literals that look like encodings (utf8, utf-8, ascii, base64, etc.)
  // Do NOT transform variables as they might be directory names or other options
  transformed = transformed.replace(
    /\bfs\.readdir\s*\(\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\2\s*\)/gi,
    (_match, pathArg, quote, encoding) => {
      return `fs.readdir(${pathArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Also handle node:fs/promises imports (readFile, writeFile, appendFile, readdir)
  // Use negative lookbehind to ensure we only match standalone function calls, not method calls
  // Pattern: readFile(path, "utf8") -> readFile(path, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  transformed = transformed.replace(
    /(?<!\.)\breadFile\s*\(\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\2\s*\)/gi,
    (_match, pathArg, quote, encoding) => {
      return `readFile(${pathArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: writeFile(path, data, "utf8") -> writeFile(path, data, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  transformed = transformed.replace(
    /(?<!\.)\bwriteFile\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\3\s*\)/gi,
    (_match, pathArg, dataArg, quote, encoding) => {
      return `writeFile(${pathArg}, ${dataArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: appendFile(path, data, "utf8") -> appendFile(path, data, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  transformed = transformed.replace(
    /(?<!\.)\bappendFile\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\3\s*\)/gi,
    (_match, pathArg, dataArg, quote, encoding) => {
      return `appendFile(${pathArg}, ${dataArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Pattern: readdir(path, "utf8") -> readdir(path, { encoding: "utf8" })
  // Only transform string literals that look like encodings
  // Do NOT transform variables as they might be directory names or other options
  transformed = transformed.replace(
    /(?<!\.)\breaddir\s*\(\s*([^,]+)\s*,\s*(["'])(utf-?8|ascii|base64|hex|latin1|ucs-?2|utf16le|binary)\2\s*\)/gi,
    (_match, pathArg, quote, encoding) => {
      return `readdir(${pathArg}, { encoding: ${quote}${encoding}${quote} })`;
    },
  );

  // Fix invalid syntax: response.(connection_uris.at(0)?.connection_uri) -> response.connection_uris.at(0)?.connection_uri
  // This fixes cases where property access got incorrectly wrapped in parentheses
  // Pattern: object.(arrayName.at(n)?.property) -> object.arrayName.at(n)?.property
  transformed = transformed.replace(
    /(\w+)\.\s*\(\s*(\w+)\.at\s*\(\s*(\d+)\s*\)\s*\?\.\s*(\w+)\s*\)/g,
    (_match, objectName, arrayName, index, property) => {
      return `${objectName}.${arrayName}.at(${index})?.${property}`;
    },
  );

  // Fix invalid syntax: array.at(0 ?? "") -> array.at(0)
  // This fixes cases where ?? "" was incorrectly placed inside .at() call
  transformed = transformed.replace(
    /(\w+)\.at\s*\(\s*(\d+)\s*\?\?\s*""\s*\)/g,
    (_match, arrayName, index) => {
      return `${arrayName}.at(${index})`;
    },
  );

  // Add nullish coalescing fallback to optional chaining expressions
  // IMPORTANT: Check if already has ?? before adding to avoid redundant coalescing
  // Pattern: array.at(n)?.property -> array.at(n)?.property ?? "" (without double wrapping)

  // Handle return statements: return array.at(0)?.name; -> return array.at(0)?.name ?? "";
  transformed = transformed.replace(
    /return\s+(\w+)\.at\((\d+)\)\?\.(\w+)(\(\))?(?!\s*\?\?)\s*;/g,
    (_match, arrayName, index, property, isMethod) => {
      const methodCall = isMethod ? "()" : "";
      return `return ${arrayName}.at(${index})?.${property}${methodCall} ?? "";`;
    },
  );

  // Handle template literals: ${array.at(0)?.name} -> ${array.at(0)?.name ?? ""}
  // Skip if already has nullish coalescing
  transformed = transformed.replace(
    /\$\{([^}]*?)(\w+)\.at\((\d+)\)\?\.(\w+)(\(\))?([^}]*?)\}/g,
    (_match, before, arrayName, index, property, isMethod, after) => {
      // Skip if already has nullish coalescing anywhere in the expression
      if (
        before.includes("??") ||
        after.includes("??") ||
        _match.includes("??")
      ) {
        return _match;
      }
      const methodCall = isMethod ? "()" : "";
      return `\${${before}${arrayName}.at(${index})?.${property}${methodCall} ?? ""${after}}`;
    },
  );

  // Handle function arguments: func(array.at(0)?.name) -> func(array.at(0)?.name ?? "")
  // Skip if already has nullish coalescing
  transformed = transformed.replace(
    /(\w+(?:\.\w+)*)\s*\(\s*([^,)]*?)(\w+)\.at\((\d+)\)\?\.(\w+)(\(\))?([^,)]*?)\s*\)/g,
    (_match, funcName, before, arrayName, index, property, isMethod, after) => {
      // Skip if already has nullish coalescing
      if (
        before.includes("??") ||
        after.includes("??") ||
        _match.includes("??")
      ) {
        return _match;
      }
      // Skip if it's a method call on the result
      if (after.trim().startsWith(".")) {
        return _match;
      }
      const methodCall = isMethod ? "()" : "";
      return `${funcName}(${before}${arrayName}.at(${index})?.${property}${methodCall} ?? ""${after})`;
    },
  );

  // Handle assignments: const x = array.at(0)?.name; -> const x = array.at(0)?.name ?? "";
  transformed = transformed.replace(
    /(const|let|var)\s+(\w+)\s*=\s*(\w+)\.at\((\d+)\)\?\.(\w+)(\(\))?(?!\s*\?\?)\s*;/g,
    (_match, keyword, varName, arrayName, index, property, isMethod) => {
      const methodCall = isMethod ? "()" : "";
      return `${keyword} ${varName} = ${arrayName}.at(${index})?.${property}${methodCall} ?? "";`;
    },
  );

  // Remove unused variables that start with underscore (TypeScript convention for intentionally unused)
  // Pattern: const _variableName = ...; -> (remove entire line including trailing newline)
  // Handle cases with or without trailing semicolon, and preserve indentation of next line
  // Match more flexibly to catch all underscore-prefixed variables
  transformed = transformed.replace(
    /^\s*(const|let|var)\s+_\w+\s*=\s*[^;\n]+;\s*\n/gm,
    "",
  );
  // Also handle cases where it's the last thing on a line before a closing brace
  transformed = transformed.replace(
    /^\s*(const|let|var)\s+_\w+\s*=\s*[^;\n]+;\s*(?=\n\s*[}\]])/gm,
    "",
  );
  // Handle cases where the assignment spans multiple lines (with line continuations)
  transformed = transformed.replace(
    /^\s*(const|let|var)\s+_\w+\s*=\s*[^;]+;\s*\n/gm,
    "",
  );

  // Remove unused variables from destructuring patterns - but be very conservative
  // Only remove if we can verify the variable is truly unused in the entire function scope
  // For now, we'll skip this transformation as it's too risky without proper scope analysis
  // The TypeScript compiler will warn about unused variables, which is safer than removing them incorrectly

  // Fix "never nullish" expressions - remove redundant nullish coalescing
  // This must run AFTER all other transformations to clean up any redundant ?? "" that were added
  // Pattern: expr ?? "" ?? "" -> expr ?? ""
  // Handle multiple redundant ?? "" in sequence - must work in all contexts
  // Use a global replacement that works recursively
  let previousTransformed = "";
  while (previousTransformed !== transformed) {
    previousTransformed = transformed;
    // Remove all redundant ?? "" sequences anywhere in the code
    transformed = transformed.replace(/(\?\?\s*"")(\s*\?\?\s*"")+/g, "$1");
    // Also handle cases with 3+ redundant coalescing: ?? "" ?? "" ?? ""
    transformed = transformed.replace(/(\?\?\s*"")(\s*\?\?\s*""){2,}/g, "$1");
  }

  // Pattern: expr ?? "" ?? "fallback" -> expr ?? "fallback" (remove the redundant ?? "")
  // Handle template literals (backticks) and other expressions
  // Match: ?? "" ?? `template` or ?? "" ?? "string" or ?? "" ?? expression
  transformed = transformed.replace(
    /\?\?\s*""\s*\?\?\s*([`'"][^`'"]*[`'"]|[^,;)\]}\s]+)/g,
    (_match, fallback) => {
      // Skip if fallback contains another ?? operator (nested case)
      if (fallback.includes("??")) {
        return _match;
      }
      return `?? ${fallback.trim()}`;
    },
  );

  // Fix specific pattern: backend.at(0)?.toUpperCase() ?? "" ?? `...`
  // This should be: backend.at(0)?.toUpperCase() ?? `...`
  // Handle template literals with ${} interpolation - match until closing backtick
  // Use a more flexible pattern that matches template literals properly
  transformed = transformed.replace(
    /(\w+\.at\(\d+\)\?\.\w+\(\))\s*\?\?\s*""\s*\?\?\s*`([^`]*(?:\$\{[^}]*\}[^`]*)*)`/g,
    (_match, expr, templateContent) => {
      return `${expr} ?? \`${templateContent}\``;
    },
  );

  // Also handle the general case: any expression ?? "" ?? template literal
  transformed = transformed.replace(
    /([^,;)\]}]+)\s*\?\?\s*""\s*\?\?\s*`([^`]*(?:\$\{[^}]*\}[^`]*)*)`/g,
    (_match, expr, templateContent) => {
      // Only apply if expr doesn't already end with ?? ""
      if (!expr.trim().endsWith('?? ""')) {
        return `${expr.trim()} ?? \`${templateContent}\``;
      }
      return _match;
    },
  );

  // Fix pattern: groups.at(0)?.name ?? "" ?? "" -> groups.at(0)?.name ?? ""
  // This is already handled by the first pattern, but keep for clarity
  transformed = transformed.replace(
    /(\w+\.at\(\d+\)\?\.\w+)\s*\?\?\s*""\s*\?\?\s*""/g,
    '$1 ?? ""',
  );

  // Fix empty template literal expressions: ${} -> (remove or replace)
  // Pattern: `text ${}` -> `text` or `text ${variable}` if we can infer it
  // For now, just remove empty expressions to fix syntax errors
  transformed = transformed.replace(/\$\{\s*\}/g, "");

  // Final cleanup: Remove ALL redundant nullish coalescing at the very end
  // This ensures we catch any redundant ?? "" that were added by previous transformations
  // Run multiple passes to catch nested cases and clean up any double-wrapped expressions
  for (let i = 0; i < 10; i++) {
    // Remove redundant ?? "" sequences: expr ?? "" ?? "" -> expr ?? ""
    transformed = transformed.replace(/(\?\?\s*"")(\s*\?\?\s*"")+/g, "$1");
    // Remove double-wrapped parentheses: ((expr) ?? "") -> (expr ?? "")
    transformed = transformed.replace(
      /\(\(([^)]+)\)\s*\?\?\s*""\)/g,
      '($1 ?? "")',
    );
    // Remove redundant ?? "" before other expressions
    transformed = transformed.replace(/\?\?\s*""\s*\?\?\s*""/g, '?? ""');
    // Clean up patterns like: ((groups.at(0)?.name) ?? "") ?? "" -> groups.at(0)?.name ?? ""
    transformed = transformed.replace(
      /\(\(([^)]+)\)\s*\?\?\s*""\)\s*\?\?\s*""/g,
      '($1 ?? "")',
    );
  }

  // Deduplicate imports
  transformed = deduplicateImports(transformed);

  return transformed;
}

function deduplicateImports(content: string): string {
  // Match all import statements
  const importRegex =
    /import\s+(?:(?:\{[^}]*\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+["']([^"']+)["'];?\n?/g;

  const imports = new Map<
    string,
    { named: Set<string>; default: Set<string>; namespace: Set<string> }
  >();
  const importLines: Array<{ match: string; module: string }> = [];

  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: needed for regex exec loop
  while ((match = importRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const module = match[1];
    if (!module) continue;

    const importPart = match[0].match(/import\s+(.+?)\s+from/)?.[1];
    if (!importPart) continue;

    if (!imports.has(module)) {
      imports.set(module, {
        named: new Set(),
        default: new Set(),
        namespace: new Set(),
      });
    }

    const moduleImports = imports.get(module)!;

    // Handle named imports: { a, b, c }
    if (importPart.startsWith("{")) {
      const namedMatch = importPart.match(/\{([^}]*)\}/);
      if (namedMatch?.[1]) {
        const namedList = namedMatch[1]
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i);
        for (const named of namedList) {
          moduleImports.named.add(named);
        }
      }
    } else if (importPart.startsWith("*")) {
      // Handle namespace imports: * as name
      const namespaceMatch = importPart.match(/\*\s+as\s+(\w+)/);
      if (namespaceMatch?.[1]) {
        moduleImports.namespace.add(`* as ${namespaceMatch[1]}`);
      }
    } else {
      // Handle default imports: name
      const trimmed = importPart.trim();
      if (trimmed) {
        moduleImports.default.add(trimmed);
      }
    }

    importLines.push({ match: fullMatch, module });
  }

  // Replace all imports with deduplicated ones
  if (importLines.length > 0 && importLines[0]) {
    // Find the first import line position
    const firstImportIndex = content.indexOf(importLines[0].match);
    const beforeImports = content.slice(0, firstImportIndex);

    // Remove all existing imports
    let afterImports = content.slice(firstImportIndex);
    for (const { match: importMatch } of importLines) {
      afterImports = afterImports.replace(importMatch, "");
    }

    // Generate deduplicated imports
    const deduplicatedImports: string[] = [];
    for (const [module, moduleImports] of imports.entries()) {
      const namedArray = Array.from(moduleImports.named).sort();
      const defaultArray = Array.from(moduleImports.default).sort();
      const namespaceArray = Array.from(moduleImports.namespace).sort();

      const parts: string[] = [];

      // Add named imports (always with braces)
      if (namedArray.length > 0) {
        parts.push(`{ ${namedArray.join(", ")} }`);
      }

      // Add default imports (no braces)
      for (const defaultImport of defaultArray) {
        parts.push(defaultImport);
      }

      // Add namespace imports (no braces)
      for (const namespace of namespaceArray) {
        parts.push(namespace);
      }

      if (parts.length === 0) continue;

      // Combine parts
      if (parts.length === 1 && defaultArray.length === 1) {
        // Single default import (no braces)
        deduplicatedImports.push(`import ${parts[0]} from "${module}";`);
      } else if (parts.length === 1 && namespaceArray.length === 1) {
        // Single namespace import (no braces)
        deduplicatedImports.push(`import ${parts[0]} from "${module}";`);
      } else {
        // Multiple imports or named imports (with braces)
        deduplicatedImports.push(
          `import ${parts.join(", ")} from "${module}";`,
        );
      }
    }

    return `${beforeImports + deduplicatedImports.join("\n")}\n${afterImports}`;
  }

  return content;
}

async function copyDirectoryRecursive(
  src: string,
  dest: string,
  baseSrcPath: string,
): Promise<void> {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath, baseSrcPath);
    } else {
      // Read as text for TypeScript files to apply transformations
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = await Bun.file(srcPath).text();
        // Calculate relative path from repo root for GitHub URL
        // baseSrcPath (cachedRepo): /path/to/cache/create-better-t-stack
        // srcPath: /path/to/cache/create-better-t-stack/apps/cli/src/utils/display-config.ts
        // We need: apps/cli/src/utils/display-config.ts
        const relativePath = srcPath.replace(baseSrcPath, "");
        // Remove leading path separator and normalize to forward slashes
        const normalizedPath = relativePath
          .replace(/^[\\/]+/, "")
          .replace(/\\/g, "/");
        const originalFilePath = normalizedPath;
        const transformed = transformFileContent(content, originalFilePath);
        await Bun.write(destPath, transformed);
      } else {
        // Copy binary files as-is
        const content = await Bun.file(srcPath).arrayBuffer();
        await Bun.write(destPath, content);
      }
    }
  }
}

async function ensureCacheIsValid(): Promise<void> {
  const cacheDir = getCacheDirectory();
  const cachedRepo = getCachedRepoPath();
  const isValid = await isCacheValid();

  if (!isValid) {
    if (await exists(cachedRepo)) {
      logger.info("🔄 Cache expired, re-downloading repository...");
      rmSync(cachedRepo, { recursive: true, force: true });
    } else {
      logger.info(`📥 Cloning ${REPO_URL}...`);
    }

    // Clone to cache
    await mkdir(cacheDir, { recursive: true });
    await $`git clone ${REPO_URL} ${cachedRepo}`.quiet();
    await updateCacheTimestamp();
    logger.success("✅ Repository cloned successfully");
  } else {
    logger.info("📦 Using cached repository...");
  }
}

export default defineCommand({
  meta: {
    name: "bts",
    description:
      "Clone create-better-t-stack and move src to packages/rebts/src/impl",
    examples: [],
  },
  args: {
    force: {
      type: "boolean",
      description: "Skip confirmation prompt and regenerate immediately",
      default: false,
    },
  },
  run: async ({ args }) => {
    // Ask for confirmation unless --force flag is used
    if (!args.force) {
      const confirmed = await confirmPrompt({
        message:
          "This will regenerate the rebts package from Better-T-Stack. Continue?",
      });

      if (isCancel(confirmed) || !confirmed) {
        logger.info("Operation cancelled.");
        return;
      }
    }
    const cwd = process.cwd();
    const cachedRepo = getCachedRepoPath();
    const srcSource = join(cachedRepo, "apps", "cli", "src");
    const srcDest = join(cwd, "packages", "rebts", "src", "impl");
    const rebtsSrcDir = join(cwd, "packages", "rebts", "src");

    try {
      // Ensure cache is valid (clone if needed)
      await ensureCacheIsValid();

      // Check if src directory exists in cached repo
      const srcExists = await exists(srcSource);
      if (!srcExists) {
        throw new Error(
          `Src directory not found at ${srcSource} in cached repository`,
        );
      }

      // Ensure packages/rebts/src exists
      const rebtsSrcExists = await exists(rebtsSrcDir);
      if (!rebtsSrcExists) {
        logger.info(`📁 Creating directory: ${rebtsSrcDir}`);
        await mkdir(rebtsSrcDir, { recursive: true });
      }

      // Delete existing impl directory if it exists
      const implDestExists = await exists(srcDest);
      if (implDestExists) {
        logger.info(`🗑️  Removing existing impl directory...`);
        rmSync(srcDest, { recursive: true, force: true });
      }

      // Copy and transform src directory from cache to impl
      logger.info(
        `📦 Copying and transforming src from cache to ${srcDest}...`,
      );
      await copyDirectoryRecursive(srcSource, srcDest, cachedRepo);
      logger.success("✅ Src copied and transformed successfully");

      // Read version from cached repo's package.json
      const cachedRepoPackageJsonPath = join(
        cachedRepo,
        "apps",
        "cli",
        "package.json",
      );
      let version = "unknown";
      try {
        const packageJsonContent = await readFile(
          cachedRepoPackageJsonPath,
          "utf-8",
        );
        const packageJson = JSON.parse(packageJsonContent) as {
          version?: string;
        };
        version = packageJson.version ?? "unknown";
      } catch {
        logger.warn(
          `Failed to read version from ${cachedRepoPackageJsonPath}, using "unknown"`,
        );
      }

      const modPath = join(rebtsSrcDir, "mod.ts");
      const modTsContent = generateModTsContent(version);
      await writeFile(modPath, modTsContent, "utf-8");
      logger.success(
        `✅ Wrote hardcoded mod.ts to ${modPath} (Better-T-Stack v${version})`,
      );

      const indexPath = join(srcDest, "index.ts");
      if (existsSync(indexPath)) {
        rmSync(indexPath);
        logger.debug(`🗑️  Removed ${indexPath}`);
      }

      const cliPath = join(srcDest, "cli.ts");
      if (existsSync(cliPath)) {
        rmSync(cliPath);
        logger.debug(`🗑️  Removed ${cliPath}`);
      }

      // Setup Biome configuration and dependencies
      const biomeJsonPath = join(cwd, "biome.json");
      if (!existsSync(biomeJsonPath)) {
        const defaultBiomeConfig = {
          $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
          files: {
            includes: ["**"],
            ignoreUnknown: false,
          },
          formatter: {
            enabled: true,
            indentStyle: "tab",
            indentWidth: 2,
            lineWidth: 80,
          },
          linter: {
            enabled: false,
          },
          javascript: {
            formatter: {
              enabled: true,
            },
          },
          json: {
            formatter: {
              enabled: true,
            },
          },
        };

        await writeFile(
          biomeJsonPath,
          JSON.stringify(defaultBiomeConfig, null, 2),
          "utf-8",
        );
        logger.success("✅ Created biome.json configuration file");
      }

      // Add @biomejs/biome to devDependencies if not present
      const packageJsonPath = join(cwd, "package.json");
      if (existsSync(packageJsonPath)) {
        try {
          const packageJsonContent = await readFile(packageJsonPath, "utf-8");
          const packageJson = JSON.parse(packageJsonContent) as {
            devDependencies?: Record<string, string>;
          };

          if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
          }

          if (!packageJson.devDependencies["@biomejs/biome"]) {
            packageJson.devDependencies["@biomejs/biome"] = "^2.3.6";
            await writeFile(
              packageJsonPath,
              JSON.stringify(packageJson, null, 2),
              "utf-8",
            );
            logger.success("✅ Added @biomejs/biome to devDependencies");
            logger.info("💡 You can format your code using: bun format");
          }
        } catch (error) {
          logger.warn(
            `Failed to update package.json: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } catch (error) {
      logger.error(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  },
});
