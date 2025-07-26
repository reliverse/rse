import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { readPackageJSON } from "pkg-types";

import { DEFAULT_CONFIG_RSE } from "~/libs/sdk/sdk-impl/config/default";

// Supported configuration filename
const CONFIG_FILENAME = ".config/rse.ts";

export async function ensureRseConfig(isDev: boolean) {
  // Check if the config file already exists
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
  const configExists = await fs.pathExists(configPath);

  // If it exists, no need to do anything.
  if (configExists) return;

  // If it doesn't exist, create it.
  try {
    // Read package.json description using pkg-types
    let pkgDescription: string | undefined;
    try {
      const pkg = await readPackageJSON();
      if (
        pkg &&
        typeof pkg.description === "string" &&
        pkg.description.trim()
      ) {
        pkgDescription = pkg.description.trim();
      }
    } catch {
      // ignore, fallback to default
    }
    // Generate and write the config file
    const configContent = generateConfig(isDev, pkgDescription);
    await fs.outputFile(configPath, configContent, { encoding: "utf8" });
    relinka("success", `Config was created at ${configPath}`);
    relinka("log", "Edit this file to customize build and publish settings");
    if (!isDev) {
      relinka("log", "Please note: commonPubPause is set to true by default");
      relinka("log", "When you're ready, run `rse pub` to build and publish");
    } else {
      relinka("log", "When you're ready, run `bun pub` to build and publish");
    }
    process.exit(0);
  } catch (error: unknown) {
    relinka(
      "error",
      `Error creating configuration file: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

export async function prepareRseEnvironment(isDev: boolean) {
  // 1. Ensure rse config exists
  await ensureRseConfig(isDev);

  const cwd = process.cwd();

  // 2. Handle .gitignore if .git directory exists
  const gitDir = path.resolve(cwd, ".git");
  if (await fs.pathExists(gitDir)) {
    await ensureGitignoreEntries(cwd);
  }

  // 3. Handle tsconfig.json
  const tsconfigPath = path.resolve(cwd, "tsconfig.json");
  if (await fs.pathExists(tsconfigPath)) {
    await ensureTsconfigIncludes(tsconfigPath);
  }

  // 4. Handle package.json scripts
  // TODO: maybe this is not useful, because e.g. `"latest": "bun rse update"` triggers `"rse": "bun rse"`
  // TODO: instead of `@reliverse/rse` directly, so user may get infinite recursion
  // const packageJsonPath = path.resolve(cwd, "package.json");
  // if (await fs.pathExists(packageJsonPath)) {
  //   await ensurePackageJsonScript(cwd, packageJsonPath);
  // }
}

async function ensureGitignoreEntries(cwd: string) {
  const gitignorePath = path.resolve(cwd, ".gitignore");

  let gitignoreContent = "";
  if (await fs.pathExists(gitignorePath)) {
    gitignoreContent = await fs.readFile(gitignorePath, "utf8");
  }

  const requiredEntries = ["dist", "dist*", "logs"];
  const lines = gitignoreContent.split("\n");
  let modified = false;

  for (const entry of requiredEntries) {
    const hasEntry = lines.some((line) => {
      const trimmedLine = line.trim();
      return (
        trimmedLine === entry ||
        (entry === "dist*" &&
          (trimmedLine === "dist*" || trimmedLine.startsWith("dist")))
      );
    });

    if (!hasEntry) {
      if (gitignoreContent && !gitignoreContent.endsWith("\n")) {
        gitignoreContent += "\n";
      }
      gitignoreContent += entry + "\n";
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(gitignorePath, gitignoreContent, "utf8");
    relinka("success", `Updated .gitignore with required entries`);
  }
}

async function ensureTsconfigIncludes(tsconfigPath: string) {
  try {
    const tsconfigContent = await fs.readFile(tsconfigPath, "utf8");
    const tsconfig = JSON.parse(tsconfigContent) as {
      include?: string[];
      [key: string]: unknown;
    };

    if (!tsconfig.include) {
      tsconfig.include = [];
    }

    const requiredInclude = ".config/**/*.ts";
    const hasConfigInclude = tsconfig.include.includes(requiredInclude);

    if (!hasConfigInclude) {
      tsconfig.include.push(requiredInclude);
      await fs.writeFile(
        tsconfigPath,
        JSON.stringify(tsconfig, null, 2),
        "utf8",
      );
      relinka("success", `Added ".config/**/*.ts" to tsconfig.json includes`);
    }
  } catch (error) {
    relinka(
      "warn",
      `Could not update tsconfig.json: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Generate the config file content
function generateConfig(isDev: boolean, pkgDescription?: string): string {}
