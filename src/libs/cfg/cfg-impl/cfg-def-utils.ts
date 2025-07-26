/* ------------------------------------------------------------------
 * Generating Default Rules for Project
 * ------------------------------------------------------------------
 */

import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { getUserPkgManager, runtimeInfo } from "@reliverse/runtime";
import { safeDestr } from "destr";
import { readPackageJSON, type PackageJson } from "pkg-types";

import type { RseConfig } from "./cfg-types";

import { getBiomeConfig } from "./cfg-biome";
import {
  DEFAULT_DOMAIN,
  UNKNOWN_VALUE,
  rseName,
  cliDomainDocs,
} from "./cfg-consts";
import { DEFAULT_CONFIG_RSE } from "./cfg-default";
import {
  detectFeatures,
  detectProjectFramework,
  getPackageJsonSafe,
} from "./cfg-detect";

/**
 * Generating a Default Config and Merging with Detected Data
 */
export async function getDefaultRseConfig(
  projectPath: string,
  isDev: boolean,
  projectName?: string,
  projectAuthor?: string,
): Promise<RseConfig> {
  const packageJson = await getPackageJsonSafe(projectPath);
  const effectiveProjectName =
    packageJson?.name ?? projectName ?? UNKNOWN_VALUE;

  let effectiveAuthorName =
    typeof packageJson?.author === "object"
      ? (packageJson.author?.name ?? projectAuthor)
      : (packageJson?.author ?? projectAuthor ?? UNKNOWN_VALUE);

  if (effectiveAuthorName === "blefnk" && isDev) {
    effectiveAuthorName = "reliverse";
  }

  const biomeConfig = await getBiomeConfig(projectPath);
  const detectedPkgManager = await getUserPkgManager(projectPath);

  const packageJsonPath = path.join(projectPath, "package.json");
  let packageData: PackageJson = {
    name: effectiveProjectName,
    author: effectiveAuthorName,
  };

  if (await fs.pathExists(packageJsonPath)) {
    try {
      packageData = await readPackageJSON(projectPath);
    } catch {
      // fallback if reading fails
    }
  }

  const detectedProjectFramework = await detectProjectFramework(projectPath);

  return {
    ...DEFAULT_CONFIG_RSE,
    projectName: effectiveProjectName,
    projectAuthor: effectiveAuthorName,
    projectDescription: packageData.description ?? UNKNOWN_VALUE,
    version: packageData.version ?? "0.1.0",
    projectLicense: packageData.license ?? "MIT",
    projectState: "creating",
    projectRepository:
      typeof packageData.repository === "string"
        ? packageData.repository
        : (packageData.repository?.url ?? DEFAULT_DOMAIN),
    projectDomain:
      effectiveProjectName === rseName ? cliDomainDocs : DEFAULT_DOMAIN,
    projectGitService: "github",
    projectDeployService: "vercel",
    repoBranch: "main",
    projectFramework: detectedProjectFramework ?? UNKNOWN_VALUE,
    projectPackageManager: detectedPkgManager.packageManager,
    projectRuntime: (["node", "deno", "bun"].includes(runtimeInfo?.name ?? "")
      ? runtimeInfo?.name
      : "node") as "node" | "deno" | "bun",
    codeStyle: {
      ...DEFAULT_CONFIG_RSE.codeStyle,
      lineWidth: biomeConfig?.lineWidth ?? 80,
      indentSize: biomeConfig?.indentWidth ?? 2,
      tabWidth: biomeConfig?.indentWidth ?? 2,
    },
  };
}

export async function generateDefaultRulesForProject(
  projectPath: string,
  isDev: boolean,
): Promise<RseConfig | null> {
  const projectCategory = await detectProjectFramework(projectPath);

  const packageJsonPath = path.join(projectPath, "package.json");
  let packageJson: any = {};
  if (await fs.pathExists(packageJsonPath)) {
    try {
      packageJson = safeDestr(await fs.readFile(packageJsonPath, "utf-8"));
    } catch {
      // ignore errors
    }
  }
  const rules = await getDefaultRseConfig(projectPath, isDev);
  if (!projectCategory) {
    rules.features = {
      ...DEFAULT_CONFIG_RSE.features,
      language: ["typescript"],
      themes: ["default"],
    };
    rules.preferredLibraries = {
      ...DEFAULT_CONFIG_RSE.preferredLibraries,
      databaseLibrary: "drizzle",
      authentication: "better-auth",
    };
    return rules;
  }

  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  // File-based detection
  const hasPrismaFile = await fs.pathExists(
    path.join(projectPath, "prisma/schema.prisma"),
  );
  const hasDrizzleFile = await fs.pathExists(
    path.join(projectPath, "drizzle.config.ts"),
  );
  const hasNextAuthDir = await fs.pathExists(
    path.join(projectPath, "src/app/api/auth/[...nextauth]"),
  );
  const hasBetterAuthFile = await fs.pathExists(
    path.join(projectPath, "src/app/api/auth/[...all]/route.ts"),
  );
  const hasShadcnUi = await fs.pathExists(
    path.join(projectPath, "components/ui"),
  );

  // Dependency-based detection
  const hasClerk = "@clerk/nextjs" in deps;
  const hasBetterAuth = "better-auth" in deps && hasBetterAuthFile;
  const hasAuth0 = "@auth0/nextjs-auth0" in deps;
  const hasSupabase = "@supabase/supabase-js" in deps;
  const hasPrisma = "@prisma/client" in deps || hasPrismaFile;
  const hasDrizzle = "drizzle-orm" in deps || hasDrizzleFile;

  // State management
  const hasZustand = "zustand" in deps;
  const hasJotai = "jotai" in deps;
  const hasRedux = "@reduxjs/toolkit" in deps || "redux" in deps;

  // Form libraries
  const hasReactHookForm = "react-hook-form" in deps;
  const hasFormik = "formik" in deps;

  // Styling libraries
  const hasTailwind = "tailwindcss" in deps;
  const hasStyledComponents = "styled-components" in deps;
  const hasCssModules =
    packageJson?.dependencies &&
    Object.keys(deps).some(
      (key) => key.includes("css-loader") || key.includes("css-modules"),
    );
  const hasSass = "sass" in deps || "node-sass" in deps;

  // UI libraries
  const _hasChakraUi = "@chakra-ui/react" in deps;
  const _hasMaterialUi = "@mui/material" in deps;

  // Testing
  const _hasBunTest =
    packageJson?.scripts &&
    Object.values(packageJson.scripts).some(
      (script) =>
        script && typeof script === "string" && script.includes("bun test"),
    );
  const _hasVitest = "vitest" in deps;
  const hasJest = "jest" in deps;
  const _hasPlaywright = "@playwright/test" in deps;
  const _hasCypress = "cypress" in deps;

  // API frameworks
  const hasHono = "hono" in deps;
  const hasTrpc = "@trpc/server" in deps;
  const hasGraphql = "graphql" in deps || "apollo-server" in deps;
  const hasRest =
    (await fs.pathExists(path.join(projectPath, "src/api"))) ||
    (await fs.pathExists(path.join(projectPath, "src/app/api")));

  // Database providers
  const hasPg = "pg" in deps || "@neondatabase/serverless" in deps;
  const hasMysql = "mysql" in deps || "mysql2" in deps;
  const hasSqlite =
    "sqlite" in deps || "sqlite3" in deps || "better-sqlite3" in deps;
  const hasMongo = "mongodb" in deps || "mongoose" in deps;

  // Other libraries to detect
  const hasZod = "zod" in deps;
  const hasTypebox = "@sinclair/typebox" in deps;
  const hasValibot = "valibot" in deps;

  // Features detection
  rules.features = await detectFeatures(projectPath, packageJson);

  // If no preferredLibraries object, create one
  if (!rules.preferredLibraries) {
    rules.preferredLibraries = { ...DEFAULT_CONFIG_RSE.preferredLibraries };
  }

  // Set specific libraries based on detection
  // Database
  if (hasDrizzle) {
    rules.preferredLibraries.databaseLibrary = "drizzle";
  } else if (hasPrisma) {
    rules.preferredLibraries.databaseLibrary = "prisma";
  } else if (hasSupabase) {
    rules.preferredLibraries.databaseLibrary = "supabase";
  }

  // Database provider
  if (hasDrizzleFile) {
    const drizzleConfigPath = path.join(projectPath, "drizzle.config.ts");
    const content = await fs.readFile(drizzleConfigPath, "utf-8");
    if (content.includes("postgres")) {
      rules.preferredLibraries.databaseProvider = "pg";
    } else if (content.includes("sqlite")) {
      rules.preferredLibraries.databaseProvider = "sqlite";
    } else if (content.includes("mysql")) {
      rules.preferredLibraries.databaseProvider = "mysql";
    }
  } else if (hasPg) {
    rules.preferredLibraries.databaseProvider = "pg";
  } else if (hasMysql) {
    rules.preferredLibraries.databaseProvider = "mysql";
  } else if (hasSqlite) {
    rules.preferredLibraries.databaseProvider = "sqlite";
  } else if (hasMongo) {
    rules.preferredLibraries.databaseProvider = "mongodb";
  }

  // Authentication
  if (hasNextAuthDir) {
    rules.preferredLibraries.authentication = "next-auth";
  } else if (hasClerk) {
    rules.preferredLibraries.authentication = "clerk";
  } else if (hasBetterAuth) {
    rules.preferredLibraries.authentication = "better-auth";
  } else if (hasAuth0) {
    rules.preferredLibraries.authentication = "auth0";
  } else if (hasSupabase) {
    rules.preferredLibraries.authentication = "supabase-auth";
  }

  // State management
  if (hasZustand) {
    rules.preferredLibraries.stateManagement = "zustand";
  } else if (hasJotai) {
    rules.preferredLibraries.stateManagement = "jotai";
  } else if (hasRedux) {
    rules.preferredLibraries.stateManagement = "redux-toolkit";
  }

  // Form management
  if (hasReactHookForm) {
    rules.preferredLibraries.formManagement = "react-hook-form";
    rules.preferredLibraries.forms = "react-hook-form";
  } else if (hasFormik) {
    rules.preferredLibraries.formManagement = "formik";
  }

  // Styling
  if (hasTailwind) {
    rules.preferredLibraries.styling = "tailwind";
  } else if (hasStyledComponents) {
    rules.preferredLibraries.styling = "styled-components";
  } else if (hasCssModules) {
    rules.preferredLibraries.styling = "css-modules";
  } else if (hasSass) {
    rules.preferredLibraries.styling = "sass";
  }

  // UI components
  if (hasShadcnUi) {
    rules.preferredLibraries.uiComponents = "shadcn-ui";
  } else if (_hasChakraUi) {
    rules.preferredLibraries.uiComponents = "chakra-ui";
  } else if (_hasMaterialUi) {
    rules.preferredLibraries.uiComponents = "material-ui";
  }

  // Testing
  if (_hasBunTest) {
    rules.preferredLibraries.testing = "bun";
  } else if (_hasVitest) {
    rules.preferredLibraries.testing = "vitest";
  } else if (hasJest) {
    rules.preferredLibraries.testing = "jest";
  } else if (_hasPlaywright) {
    rules.preferredLibraries.testing = "playwright";
  } else if (_hasCypress) {
    rules.preferredLibraries.testing = "cypress";
  }

  // API
  if (hasHono) {
    rules.preferredLibraries.api = "hono";
  } else if (hasTrpc) {
    rules.preferredLibraries.api = "trpc";
  } else if (hasGraphql) {
    rules.preferredLibraries.api = "graphql";
  } else if (hasRest) {
    rules.preferredLibraries.api = "rest";
  }

  // Validation
  if (hasZod) {
    rules.preferredLibraries.validation = "zod";
  } else if (hasTypebox) {
    rules.preferredLibraries.validation = "typebox";
  } else if (hasValibot) {
    rules.preferredLibraries.validation = "valibot";
  }

  // Add more specific library detections for other categories

  return rules;
}
