import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineCommand } from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";
import { $ } from "bun";

const WORKSPACE_ROOT = process.cwd();
const REBTS_ROOT = join(WORKSPACE_ROOT, "packages", "rebts");
const REBTS_PACKAGE_JSON = join(REBTS_ROOT, "package.json");
const TEMPLATE_MANAGER_PATH = join(
  REBTS_ROOT,
  "src",
  "impl",
  "helpers",
  "core",
  "template-manager.ts",
);

const GIT_UTILS_PKG = "@reliverse/rse-git-utils";

export default defineCommand({
  meta: {
    name: "postbts",
    description: "Apply codemods to the generated rebts package",
    examples: ["postbts"],
  },
  args: {},
  run: async () => {
    const packageJsonChanged = await ensureGitUtilsDependency();
    const templateManagerChanged = await updateTemplateManager();

    if (packageJsonChanged) {
      logger.info("📦 Installing workspace dependencies...");
      await $`bun install`.quiet();
    }

    if (!packageJsonChanged && !templateManagerChanged) {
      logger.info("✅ No post-BTS changes required.");
      return;
    }

    logger.success("🎯 Post-BTS updates applied successfully.");
  },
});

async function ensureGitUtilsDependency(): Promise<boolean> {
  const packageJsonRaw = await readFile(REBTS_PACKAGE_JSON, "utf-8");
  const packageJson = JSON.parse(packageJsonRaw) as {
    dependencies?: Record<string, string>;
  };

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  if (packageJson.dependencies[GIT_UTILS_PKG] === "workspace:*") {
    return false;
  }

  packageJson.dependencies[GIT_UTILS_PKG] = "workspace:*";
  await writeFile(
    REBTS_PACKAGE_JSON,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf-8",
  );
  logger.success(
    `📦 Added ${GIT_UTILS_PKG} to packages/rebts/package.json dependencies`,
  );
  return true;
}

async function updateTemplateManager(): Promise<boolean> {
  let content = await readFile(TEMPLATE_MANAGER_PATH, "utf-8");
  let updated = false;

  const pkgRootImportPattern =
    /import\s+\{\s*PKG_ROOT\s*\}\s+from\s+"..\/..\/constants";\n/;
  if (pkgRootImportPattern.test(content)) {
    content = content.replace(pkgRootImportPattern, "");
    updated = true;
  }

  if (!content.includes(GIT_UTILS_PKG)) {
    const globImport = 'import { Glob } from "bun";\n';
    if (content.includes(globImport)) {
      content = content.replace(
        globImport,
        `${globImport}import { ensureBetterTStackRepo } from "@reliverse/rse-git-utils";\n`,
      );
    } else {
      content = `import { ensureBetterTStackRepo } from "@reliverse/rse-git-utils";\n${content}`;
    }
    updated = true;
  }

  if (!content.includes("async function getBetterTStackTemplatesRoot")) {
    const helperBlock = `
let templatesRootPromise: Promise<string> | null = null;

async function getBetterTStackTemplatesRoot(): Promise<string> {
  if (!templatesRootPromise) {
    templatesRootPromise = ensureBetterTStackRepo().then((repoPath) => {
      return path.join(repoPath, "apps", "cli");
    });
  }

  return templatesRootPromise;
}

async function resolveTemplatePath(relativePath: string): Promise<string> {
  return path.join(
    await getBetterTStackTemplatesRoot(),
    "templates",
    relativePath,
  );
}
`;

    const firstExportIndex = content.indexOf("export async function");
    if (firstExportIndex === -1) {
      throw new Error("Unable to locate export block in template-manager.ts");
    }

    content = `${content.slice(0, firstExportIndex)}${helperBlock}\n${content.slice(firstExportIndex)}`;
    updated = true;
  }

  const templatePathPattern =
    /path\.join\(\s*PKG_ROOT\s*,\s*(?:\n\s*)?([`'"])([\s\S]*?)\1\s*,?\s*\)/g;

  const replacedContent = content.replace(
    templatePathPattern,
    (_match, quote, templatePath) => {
      const cleanedPath = templatePath.trim().startsWith("templates/")
        ? templatePath.trim().slice("templates/".length)
        : templatePath.trim();
      return `await resolveTemplatePath(${quote}${cleanedPath}${quote})`;
    },
  );

  const danglingCommaPattern = /await resolveTemplatePath\(([^)]+)\),\s*\);/g;
  const cleanedContent = replacedContent.replace(
    danglingCommaPattern,
    (_match, args) => {
      return `await resolveTemplatePath(${args.trim()});`;
    },
  );

  if (cleanedContent !== content) {
    content = cleanedContent;
    updated = true;
  } else if (replacedContent !== content) {
    content = replacedContent;
    updated = true;
  }

  if (!updated) {
    return false;
  }

  await writeFile(TEMPLATE_MANAGER_PATH, content, "utf-8");
  logger.success("🛠️ Updated template-manager to load templates from git cache");
  return true;
}
