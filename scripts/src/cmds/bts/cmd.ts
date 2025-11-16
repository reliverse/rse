import { existsSync, rmSync } from "node:fs";
import { exists, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { $ } from "bun";
import MagicString from "magic-string";

const REPO_URL = "https://github.com/AmanVarshney01/create-better-t-stack";
const REPO_NAME = "create-better-t-stack";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REMOVE_INDEX_TS = true; // Delete index.ts after transformation (functionality moved to mod.ts)

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

function transformFileContent(content: string): string {
  let transformed = content;

  // Replace @clack/prompts imports - handle spinner separately
  // Check if import contains spinner
  transformed = transformed.replace(
    /import\s+\{([^}]*)\}\s+from\s+["']@clack\/prompts["'];?\n?/g,
    (_match, imports) => {
      const importList = imports.split(",").map((i: string) => i.trim());
      const hasSpinner = importList.some((i: string) => i === "spinner");
      const hasSelect = importList.some((i: string) => i === "select");
      const hasMultiselect = importList.some(
        (i: string) => i === "multiselect",
      );
      const hasText = importList.some((i: string) => i === "text");
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
          i !== "text" &&
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

      // Add isCancel and exitCancelled imports if present
      const promptImports: string[] = [];
      if (
        hasIsCancel ||
        hasExitCancelled ||
        hasSelect ||
        hasMultiselect ||
        hasText
      ) {
        const promptImportList: string[] = [];
        if (hasSelect) promptImportList.push("selectPrompt");
        if (hasMultiselect) promptImportList.push("multiselectPrompt");
        if (hasText) promptImportList.push("inputPrompt");
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

  // Replace fs-extra imports with @reliverse/relifso
  transformed = transformed.replace(
    /import\s+fs\s+from\s+["']fs-extra["'];?\n?/g,
    'import fs from "@reliverse/relifso";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*fs[^}]*\}\s+from\s+["']fs-extra["'];?\n?/g,
    'import fs from "@reliverse/relifso";\n',
  );

  // Replace node:path imports with @reliverse/pathkit
  transformed = transformed.replace(
    /import\s+path\s+from\s+["']node:path["'];?\n?/g,
    'import path from "@reliverse/pathkit";\n',
  );
  transformed = transformed.replace(
    /import\s+\{[^}]*path[^}]*\}\s+from\s+["']node:path["'];?\n?/g,
    'import path from "@reliverse/pathkit";\n',
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

  // Replace clack/prompts usage with logger
  transformed = transformed.replace(/\bintro\(/g, "logger.info(");
  transformed = transformed.replace(
    /\blog\.(success|info|warn|error)\(/g,
    "logger.$1(",
  );
  transformed = transformed.replace(/\blog\.message\(/g, "logger.log(");
  transformed = transformed.replace(/\boutro\(/g, "logger.info(");
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
  // Replace text() calls with inputPrompt()
  // Handle both text(...) and text<Type>(...) - remove generics as inputPrompt doesn't support them
  // Be careful not to match .text() which is a method on Bun's $ template literals
  transformed = transformed.replace(/\btext(<[^>]*>)?\(/g, () => {
    return "inputPrompt(";
  });
  // Transform selectPrompt options object properties
  // message -> title (in the main options object, only in selectPrompt context)
  // We transform all message: to title: since this codemod runs on specific files
  transformed = transformed.replace(/\bmessage\s*:/g, "title:");
  // Keep hint as is (dler-prompt now uses hint instead of description)
  // Remove initialValue property (selectPrompt doesn't support it)
  // Handle: , initialValue: "value" or , initialValue: value
  transformed = transformed.replace(
    /,\s*initialValue\s*:\s*(?:"[^"]*"|'[^']*'|[^,}\]]+)\s*/g,
    "",
  );
  // Handle: initialValue: "value", or initialValue: value (at start or end)
  transformed = transformed.replace(
    /\binitialValue\s*:\s*(?:"[^"]*"|'[^']*'|[^,}\]]+)\s*,?\s*/g,
    "",
  );
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
  transformed = transformed.replace(/\bconsola\.box\(/g, "logger.info(");
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
            `import path from "@reliverse/pathkit";\nimport { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";\n${firstImportMatch[0]}`,
          );
        } else {
          // No imports found, add at the top
          transformed = `import path from "@reliverse/pathkit";\nimport { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";\n${transformed}`;
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
): Promise<void> {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      // Read as text for TypeScript files to apply transformations
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = await Bun.file(srcPath).text();
        const transformed = transformFileContent(content);
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
  args: {},
  run: async () => {
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
      await copyDirectoryRecursive(srcSource, srcDest);
      logger.success("✅ Src copied and transformed successfully");

      // Transform index.ts to mod.ts in parent directory using magic-string
      if (REMOVE_INDEX_TS) {
        const indexPath = join(srcDest, "index.ts");
        if (existsSync(indexPath)) {
          // Read and transform index.ts
          const indexContent = await readFile(indexPath, "utf-8");

          // First apply standard transformations
          const standardTransformed = transformFileContent(indexContent);

          // Then use magic-string for precise index.ts -> mod.ts transformations
          const magic = new MagicString(standardTransformed);

          // Remove router export and related code
          // Find and remove: export const router = os.router({...});
          const routerStart = magic.original.search(
            /export\s+const\s+router\s*=\s*os\.router\(/,
          );
          if (routerStart !== -1) {
            // Find the matching closing brace by tracking depth
            let depth = 0;
            let inString = false;
            let stringChar = "";
            let i = routerStart;
            let foundOpening = false;

            // Find the opening brace
            while (i < magic.original.length) {
              const char = magic.original[i];
              if (!inString && char === "{") {
                depth = 1;
                foundOpening = true;
                i++;
                break;
              } else if (
                !inString &&
                (char === '"' || char === "'" || char === "`")
              ) {
                inString = true;
                stringChar = char;
              } else if (
                inString &&
                char === stringChar &&
                magic.original[i - 1] !== "\\"
              ) {
                inString = false;
              }
              i++;
            }

            // Find the matching closing brace
            if (foundOpening) {
              while (i < magic.original.length && depth > 0) {
                const char = magic.original[i];
                if (
                  !inString &&
                  (char === '"' || char === "'" || char === "`")
                ) {
                  inString = true;
                  stringChar = char;
                } else if (
                  inString &&
                  char === stringChar &&
                  magic.original[i - 1] !== "\\"
                ) {
                  inString = false;
                } else if (!inString && char === "{") {
                  depth++;
                } else if (!inString && char === "}") {
                  depth--;
                }
                i++;
              }
              // Include the semicolon after the closing brace
              while (i < magic.original.length && magic.original[i] !== ";") {
                i++;
              }
              if (i < magic.original.length) i++; // Include the semicolon
              magic.remove(routerStart, i);
            }
          }

          // Remove const caller = createRouterClient(router, { context: {} });
          const callerMatch = magic.original.match(
            /const\s+caller\s*=\s*createRouterClient\([^)]+\);/,
          );
          if (callerMatch) {
            const start = magic.original.indexOf(callerMatch[0]);
            const end = start + callerMatch[0].length;
            magic.remove(start, end);
          }

          // Remove export function createBtsCli() {...}
          const createBtsCliStart = magic.original.search(
            /export\s+function\s+createBtsCli\(\)/,
          );
          if (createBtsCliStart !== -1) {
            // Find the matching closing brace
            let depth = 0;
            let inString = false;
            let stringChar = "";
            let i = createBtsCliStart;
            let foundOpening = false;

            // Find the opening brace
            while (i < magic.original.length) {
              const char = magic.original[i];
              if (!inString && char === "{") {
                depth = 1;
                foundOpening = true;
                i++;
                break;
              } else if (
                !inString &&
                (char === '"' || char === "'" || char === "`")
              ) {
                inString = true;
                stringChar = char;
              } else if (
                inString &&
                char === stringChar &&
                magic.original[i - 1] !== "\\"
              ) {
                inString = false;
              }
              i++;
            }

            // Find the matching closing brace
            if (foundOpening) {
              while (i < magic.original.length && depth > 0) {
                const char = magic.original[i];
                if (
                  !inString &&
                  (char === '"' || char === "'" || char === "`")
                ) {
                  inString = true;
                  stringChar = char;
                } else if (
                  inString &&
                  char === stringChar &&
                  magic.original[i - 1] !== "\\"
                ) {
                  inString = false;
                } else if (!inString && char === "{") {
                  depth++;
                } else if (!inString && char === "}") {
                  depth--;
                }
                i++;
              }
              magic.remove(createBtsCliStart, i);
            }
          }

          // Transform programmatic functions to call handlers directly
          // Replace caller.init([projectName, programmaticOpts]) with direct handler call
          magic.replace(
            /const\s+result\s*=\s*await\s+caller\.init\(\[projectName,\s*programmaticOpts\]\);/g,
            "const result = await createProjectHandler(combinedInput);",
          );

          // Transform the full init function body - handle multiline
          const initFunctionMatch = magic.original.match(
            /export\s+async\s+function\s+init\([^)]*\)\s*\{([\s\S]*?)\n\}/,
          );
          if (initFunctionMatch?.[1]) {
            const fullMatch = initFunctionMatch[0];
            const bodyMatch = initFunctionMatch[1];
            if (bodyMatch.includes("caller.init")) {
              const start = magic.original.indexOf(fullMatch);
              const bodyStart = start + fullMatch.indexOf("{") + 1;
              const bodyEnd = start + fullMatch.lastIndexOf("}");
              const newBody = `	const opts = (options ?? {}) as CreateInput;
	const combinedInput = {
		projectName,
		...opts,
	};
	const result = await createProjectHandler(combinedInput);
	return result as InitResult;`;
              magic.update(bodyStart, bodyEnd, newBody);
            }
          }

          // Transform caller.add() to direct handler call
          magic.replace(
            /await\s+caller\.add\(\[options\]\);/g,
            "await addAddonsHandler(options ?? {});",
          );
          magic.replace(
            /const\s+\[options\]\s*=\s*input;\s*await\s+caller\.add\(\[options\]\);/g,
            "await addAddonsHandler(options ?? {});",
          );

          magic.replace(
            /return\s+caller\.sponsors\(\);/g,
            `try {
    renderTitle();
    logger.info(re.magenta("Better-T-Stack Sponsors"));
    const sponsors = await fetchSponsors();
    displaySponsors(sponsors);
  } catch (error) {
    handleError(error, "Failed to display sponsors");
  }`,
          );
          magic.replace(
            /return\s+caller\.docs\(\);/g,
            `const DOCS_URL = "https://better-t-stack.dev/docs";
  try {
    await openUrl(DOCS_URL);
    logger.success(re.blue("Opened docs in your default browser."));
  } catch {
    logger.log(\`Please visit \${DOCS_URL}\`);
  }`,
          );
          magic.replace(
            /return\s+caller\.builder\(\);/g,
            `const BUILDER_URL = "https://better-t-stack.dev/new";
  try {
    await openUrl(BUILDER_URL);
    logger.success(re.blue("Opened builder in your default browser."));
  } catch {
    logger.log(\`Please visit \${BUILDER_URL}\`);
  }`,
          );

          // Remove unused imports: os, createRouterClient, createCli, z, getLatestCLIVersion, init from create-better-t-stack
          magic.replace(/import\s+.*\bos\b[^;]*from[^;]+;/g, "");
          magic.replace(
            /import\s+.*\bcreateRouterClient\b[^;]*from[^;]+;/g,
            "",
          );
          magic.replace(/import\s+.*\bcreateCli\b[^;]*from[^;]+;/g, "");
          magic.replace(/import\s+z\s+from\s+["']zod["'];?\n?/g, "");
          magic.replace(
            /import\s+.*\bgetLatestCLIVersion\b[^;]*from[^;]+;/g,
            "",
          );
          magic.replace(
            /import\s+\{\s*init\s*\}\s+from\s+["']create-better-t-stack["'];?\n?/g,
            "",
          );

          // Fix import paths - add ./impl/ prefix for relative imports
          magic.replace(
            /from\s+["']\.\/(utils|helpers|types|prompts)/g,
            (match) => {
              return match.replace("./", "./impl/");
            },
          );

          // Convert type-only imports to use import type
          magic.replace(
            /import\s+\{\s*type\s+([^}]+)\}\s+from\s+["']([^"']+)["'];?/g,
            (_match, types, from) => {
              // Remove 'type' keyword and use import type syntax
              const cleanTypes = types
                .split(",")
                .map((i: string) => i.trim().replace(/^type\s+/, ""))
                .join(", ");
              return `import type { ${cleanTypes} } from "${from}";`;
            },
          );
          // Convert imports that are only types to import type
          magic.replace(
            /import\s+\{\s*([^}]*type[^}]+)\}\s+from\s+["']([^"']+)["'];?/g,
            (match, imports, from) => {
              // Check if all imports are types
              const importList = imports
                .split(",")
                .map((i: string) => i.trim());
              const allTypes = importList.every(
                (i: string) => i.startsWith("type ") || i.startsWith("type\t"),
              );
              if (allTypes) {
                // Remove 'type' keyword from each import and use import type
                const cleanImports = importList
                  .map((i: string) => i.replace(/^type\s+/, ""))
                  .join(", ");
                return `import type { ${cleanImports} } from "${from}";`;
              }
              return match;
            },
          );

          // Remove unused schema imports (keep only types)
          // Find the types import and remove all Schema imports (handle multiline)
          // Note: This runs after import path fixes, so it should match ./impl/types
          const typesImportMatch = magic.original.match(
            /import\s+\{([\s\S]*?)\}\s+from\s+["']\.\/impl\/types["'];?/,
          );
          if (typesImportMatch?.[1]) {
            const imports = typesImportMatch[1];
            const importList = imports
              .split(",")
              .map((i) => i.trim())
              .filter(
                (i) => i && !i.endsWith("Schema") && !i.match(/^\w+Schema$/),
              );

            if (importList.length > 0) {
              const start = magic.original.indexOf(typesImportMatch[0]);
              const end = start + typesImportMatch[0].length;
              // Clean up type keywords
              const cleanImports = importList
                .map((i: string) => i.replace(/^type\s+/, ""))
                .join(",\n\t");
              const newImport = `import type {\n\t${cleanImports},\n} from "./impl/types";`;
              magic.update(start, end, newImport);
            } else {
              // Remove the entire import if no types remain
              const start = magic.original.indexOf(typesImportMatch[0]);
              const end = start + typesImportMatch[0].length;
              magic.remove(start, end);
            }
          }

          // Remove extra blank lines (more than 2 consecutive newlines)
          magic.replace(/\n{3,}/g, "\n\n");

          // Fix formatting in init function - fix the function body formatting
          magic.replace(
            /export\s+async\s+function\s+init\([^)]*\)\s*\{\s*const\s+opts/g,
            "export async function init(projectName?: string, options?: CreateInput) {\n\tconst opts",
          );
          // Fix closing brace formatting
          magic.replace(
            /return\s+result\s+as\s+InitResult;\}/g,
            "return result as InitResult;\n}",
          );

          // Add missing add function if it doesn't exist
          if (!magic.original.includes("export async function add")) {
            const sponsorsStart = magic.original.search(
              /export\s+async\s+function\s+sponsors/,
            );
            if (sponsorsStart !== -1) {
              magic.prependLeft(
                sponsorsStart,
                "export async function add(options?: AddInput) {\n\tawait addAddonsHandler(options ?? {});\n}\n\n",
              );
            }
          }

          // Write to mod.ts in parent directory (packages/rebts/src/mod.ts)
          const modPath = join(rebtsSrcDir, "mod.ts");
          await writeFile(modPath, magic.toString(), "utf-8");
          logger.debug(
            `📝 Generated ${modPath} from index.ts using magic-string`,
          );

          // Remove original index.ts
          rmSync(indexPath);
          logger.debug(`🗑️  Removed ${indexPath}`);
        }
        const cliPath = join(srcDest, "cli.ts");
        if (existsSync(cliPath)) {
          rmSync(cliPath);
          logger.debug(`🗑️  Removed ${cliPath}`);
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
