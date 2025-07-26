// most of the things in this file are temporary

import path from "@reliverse/pathkit";
import os from "node:os";

// PROJECT ROOT
export const PROJECT_ROOT = path.resolve(process.cwd());

// CLI VERSION AND NAME
export const rseName = "@reliverse/rse";

// GENERAL CONFIG NAMES
export const tsconfigJson = "tsconfig.json";

// RSE CONFIG
export const cliConfigJsonc = ".config/rse.jsonc";
export const cliConfigJsoncTmp = ".config/rse.jsonc.tmp";
export const cliConfigJsoncBak = "rse.jsonc.bak";

// RSE CONFIG
export const cliConfigTs = ".config/rse.ts";
export const cliConfigTsTmp = ".config/rse.ts.tmp";
export const cliConfigTsBak = "rse.ts.bak";

// DOCUMENTATION WEBSITE
export const rseOrg = "https://reliverse.org";
export const rseOrgBase = "reliverse.org";
export const cliDomainRoot = "https://docs.reliverse.org";
export const cliDomainDocs = "https://docs.reliverse.org/cli";
export const cliDomainEnv = "https://docs.reliverse.org/env";

// HOMEDIR OF THE CLI
export const homeDir = os.homedir();
export const cliHomeDir = path.join(homeDir, ".reliverse");
export const cliHomeTmp = path.join(cliHomeDir, "temp");
export const cliHomeRepos = path.join(cliHomeDir, "repos");
export const memoryPath = path.join(cliHomeDir, "memory.db");
export const cliJsrPath = path.join(cliHomeDir, "cli");

export const useLocalhost = false;

export const DEFAULT_CLI_USERNAME = "johnny911";

export const endTitle = `📚 Check the docs to learn more: ${cliDomainDocs}`;

export const UNKNOWN_VALUE = "unknown";
export const DEFAULT_DOMAIN = "https://example.com";
export const RSE_SCHEMA_DEV = "./schema.json";
export const RSE_SCHEMA_URL = `${rseOrg}/schema.json`;

export const FALLBACK_ENV_EXAMPLE_URL =
  "https://raw.githubusercontent.com/blefnk/relivator/main/.env.example";

// Configuration file categories for generation
export const CONFIG_CATEGORIES = {
  core: [cliConfigJsonc, cliConfigTs],
  linting: ["biome.json"],
  ide: [".vscode/settings.json"],
  git: [".gitignore"],
} as const;
