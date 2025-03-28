/* ------------------------------------------------------------------
 * Project & Features Detection
 * ------------------------------------------------------------------
 */

import { relinka } from "@reliverse/prompts";
import fs from "fs-extra";
import path from "pathe";
import { readPackageJSON, type PackageJson } from "pkg-types";

import type { ProjectFramework } from "~/libs/cfg/cfg-main.js";

import { getProjectContent } from "~/libs/sdk/utils/getProjectContent.js";

import type { DetectedProject } from "./rc-types.js";

import { PROJECT_FRAMEWORK_FILES } from "./rc-const.js";
import { getReliverseConfigPath } from "./rc-path.js";
import { readReliverseConfig } from "./rc-read.js";

export async function detectProjectFramework(
  projectPath: string,
): Promise<ProjectFramework | null> {
  for (const [type, files] of Object.entries(PROJECT_FRAMEWORK_FILES)) {
    for (const file of files) {
      if (await fs.pathExists(path.join(projectPath, file))) {
        return type as ProjectFramework;
      }
    }
  }
  return null;
}

export async function getPackageJson(
  projectPath: string,
): Promise<PackageJson | null> {
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!(await fs.pathExists(packageJsonPath))) return null;
    return await readPackageJSON(projectPath);
  } catch (error) {
    const packageJsonPath = path.join(projectPath, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      relinka(
        "warn",
        "Could not read package.json:",
        error instanceof Error ? error.message : String(error),
      );
    }
    return null;
  }
}

export async function getPackageJsonSafe(
  projectPath: string,
): Promise<PackageJson | null> {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (!(await fs.pathExists(packageJsonPath))) return null;
  return await readPackageJSON(projectPath);
}

export async function detectProject(
  projectPath: string,
  isDev: boolean,
): Promise<DetectedProject | null> {
  try {
    const { requiredContent, optionalContent } =
      await getProjectContent(projectPath);
    if (!requiredContent.fileReliverse || !requiredContent.filePackageJson)
      return null;
    const { configPath } = await getReliverseConfigPath(
      projectPath,
      isDev,
      false,
    );
    if (!(await fs.pathExists(configPath))) return null;
    const config = await readReliverseConfig(configPath, isDev);
    if (!config) return null;
    return {
      name: path.basename(projectPath),
      path: projectPath,
      config,
      needsDepsInstall: !optionalContent.dirNodeModules,
      hasGit: optionalContent.dirGit,
    };
  } catch (error) {
    relinka(
      "warn",
      `Error processing ${projectPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

export async function detectProjectsWithReliverse(
  projectPath: string,
  isDev: boolean,
): Promise<DetectedProject[]> {
  const detected: DetectedProject[] = [];
  const rootProject = await detectProject(projectPath, isDev);
  if (rootProject) detected.push(rootProject);

  try {
    const items = await fs.readdir(projectPath, { withFileTypes: true });
    const subProjects = await Promise.all(
      items
        .filter((item) => item.isDirectory())
        .map(async (item) => {
          const effectiveProjectPath = path.join(projectPath, item.name);
          return await detectProject(effectiveProjectPath, isDev);
        }),
    );
    for (const project of subProjects) {
      if (project) detected.push(project);
    }
  } catch (error) {
    relinka(
      "warn",
      `Error reading directory ${projectPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return detected;
}

export async function detectFeatures(
  projectPath: string,
  packageJson: PackageJson | null,
): Promise<{
  i18n: boolean;
  analytics: boolean;
  themeMode: "light" | "dark" | "dark-light";
  authentication: boolean;
  api: boolean;
  database: boolean;
  testing: boolean;
  docker: boolean;
  ci: boolean;
  commands: string[];
  webview: string[];
  language: string[];
  themes: string[];
}> {
  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  // Authentication libraries
  const hasNextAuth = "next-auth" in deps;
  const hasClerk = "@clerk/nextjs" in deps;
  const hasBetterAuth = "better-auth" in deps;
  const hasAuth0 = "@auth0/nextjs-auth0" in deps;

  // Database libraries
  const hasPrisma = "@prisma/client" in deps;
  const hasDrizzle = "drizzle-orm" in deps;
  const hasSupabase = "@supabase/supabase-js" in deps;
  const hasMongoose = "mongoose" in deps;

  // Database providers
  const hasPg = "pg" in deps || "@neondatabase/serverless" in deps;
  const hasMysql = "mysql" in deps || "mysql2" in deps;
  const hasSqlite =
    "sqlite" in deps || "sqlite3" in deps || "better-sqlite3" in deps;
  const hasMongo = "mongodb" in deps || "mongoose" in deps;

  // Analytics
  const hasVercelAnalytics = "@vercel/analytics" in deps;
  const hasSegmentAnalytics = "@segment/analytics-next" in deps;
  const hasGoogleAnalytics = "ga-4-react" in deps || "react-ga" in deps;
  const hasPlausible = "next-plausible" in deps;
  const hasFathom = "fathom-client" in deps;

  // State management
  const hasZustand = "zustand" in deps;
  const hasJotai = "jotai" in deps;
  const hasRedux = "@reduxjs/toolkit" in deps || "redux" in deps;

  // Form management
  const hasReactHookForm = "react-hook-form" in deps;
  const hasFormik = "formik" in deps;

  // Styling
  const hasTailwind = "tailwindcss" in deps;
  const hasStyledComponents = "styled-components" in deps;
  const hasCssModules =
    packageJson?.dependencies &&
    Object.keys(deps).some(
      (key) => key.includes("css-loader") || key.includes("css-modules"),
    );
  const hasSass = "sass" in deps || "node-sass" in deps;

  // UI Components
  const hasShadcnUi = await fs.pathExists(
    path.join(projectPath, "components/ui"),
  );
  const hasChakraUi = "@chakra-ui/react" in deps;
  const hasMaterialUi = "@mui/material" in deps;

  // Testing
  const hasBunTest =
    packageJson?.scripts &&
    Object.values(packageJson.scripts).some(
      (script) =>
        script && typeof script === "string" && script.includes("bun test"),
    );
  const hasVitest = "vitest" in deps;
  const hasJest = "jest" in deps;
  const hasPlaywright = "@playwright/test" in deps;
  const hasCypress = "cypress" in deps;

  // API
  const hasHono = "hono" in deps;
  const hasTrpc = "@trpc/server" in deps;
  const hasGraphql = "graphql" in deps || "apollo-server" in deps;
  const hasRest =
    (await fs.pathExists(path.join(projectPath, "src/api"))) ||
    (await fs.pathExists(path.join(projectPath, "src/app/api")));

  // Linting and formatting
  const hasEslint = "eslint" in deps;
  const hasBiome = "@biomejs/biome" in deps;

  // Payments
  const hasStripe = "stripe" in deps || "@stripe/stripe-js" in deps;

  // Monitoring
  const hasSentry = "@sentry/nextjs" in deps || "@sentry/react" in deps;

  // Logging
  const hasAxiom = "next-axiom" in deps;

  // Notifications
  const hasSonner = "sonner" in deps;

  // Search
  const hasAlgolia = "algoliasearch" in deps || "react-instantsearch" in deps;

  // Uploads
  const hasUploadthing = "uploadthing" in deps;

  // Validation
  const hasZod = "zod" in deps;
  const hasTypebox = "@sinclair/typebox" in deps;
  const hasValibot = "valibot" in deps;

  // Documentation
  const hasStarlight = "@astrojs/starlight" in deps;
  const hasNextra = "nextra" in deps;

  // Icons
  const hasLucide = "lucide-react" in deps;

  // Mail
  const hasResend = "resend" in deps;

  // Cache
  const hasRedis = "redis" in deps || "@upstash/redis" in deps;

  // Storage & CDN
  const hasCloudflare =
    "cloudflare" in deps || "@cloudflare/workers-types" in deps;

  // CMS
  const hasContentlayer = "contentlayer" in deps;

  // i18n
  const hasNextIntl = "next-intl" in deps;
  const hasI18next = "i18next" in deps || "react-i18next" in deps;
  const hasRosetta = "rosetta" in deps;

  // SEO
  const hasNextSeo = "next-seo" in deps;

  // Motion
  const hasFramer = "framer-motion" in deps;

  // Charts
  const hasRecharts = "recharts" in deps;

  // Dates
  const hasDayjs = "dayjs" in deps;

  // Markdown
  const hasMdx = "mdx" in deps || "@next/mdx" in deps;

  // Project infra
  const hasDocker = await fs.pathExists(path.join(projectPath, "Dockerfile"));
  const hasCI =
    (await fs.pathExists(path.join(projectPath, ".github/workflows"))) ||
    (await fs.pathExists(path.join(projectPath, ".gitlab-ci.yml")));

  // Detect languages
  const languages: string[] = ["typescript"];
  if (
    "python" in deps ||
    (await fs.pathExists(path.join(projectPath, "requirements.txt")))
  ) {
    languages.push("python");
  }
  if (await fs.pathExists(path.join(projectPath, "go.mod"))) {
    languages.push("go");
  }
  if (await fs.pathExists(path.join(projectPath, "Cargo.toml"))) {
    languages.push("rust");
  }

  // Detect themes and libraries
  const themes: string[] = ["default"];
  if (hasTailwind) {
    themes.push("tailwind");
  }
  if (hasChakraUi) {
    themes.push("chakra");
  }
  if (hasMaterialUi) {
    themes.push("material");
  }
  if (hasStyledComponents) {
    themes.push("styled-components");
  }
  if (hasCssModules) {
    themes.push("css-modules");
  }
  if (hasSass) {
    themes.push("sass");
  }
  if (hasShadcnUi) {
    themes.push("shadcn");
  }

  // Detect state management
  if (hasZustand) {
    themes.push("zustand");
  }
  if (hasJotai) {
    themes.push("jotai");
  }
  if (hasRedux) {
    themes.push("redux");
  }

  // Detect form libraries
  if (hasReactHookForm) {
    themes.push("react-hook-form");
  }
  if (hasFormik) {
    themes.push("formik");
  }

  // Detect linting and formatting
  if (hasEslint) {
    themes.push("eslint");
  }
  if (hasBiome) {
    themes.push("biome");
  }

  // Detect payment providers
  if (hasStripe) {
    themes.push("stripe");
  }

  // Detect monitoring tools
  if (hasSentry) {
    themes.push("sentry");
  }

  // Detect logging
  if (hasAxiom) {
    themes.push("axiom");
  }

  // Detect notifications
  if (hasSonner) {
    themes.push("sonner");
  }

  // Detect search
  if (hasAlgolia) {
    themes.push("algolia");
  }

  // Detect upload providers
  if (hasUploadthing) {
    themes.push("uploadthing");
  }

  // Detect validation libraries
  if (hasZod) {
    themes.push("zod");
  }
  if (hasTypebox) {
    themes.push("typebox");
  }
  if (hasValibot) {
    themes.push("valibot");
  }

  // Detect documentation
  if (hasStarlight) {
    themes.push("starlight");
  }
  if (hasNextra) {
    themes.push("nextra");
  }

  // Detect icons
  if (hasLucide) {
    themes.push("lucide");
  }

  // Detect mail providers
  if (hasResend) {
    themes.push("resend");
  }

  // Detect cache providers
  if (hasRedis) {
    themes.push("redis");
  }

  // Detect CDN/Storage
  if (hasCloudflare) {
    themes.push("cloudflare");
  }

  // Detect CMS
  if (hasContentlayer) {
    themes.push("contentlayer");
  }

  // Detect SEO
  if (hasNextSeo) {
    themes.push("next-seo");
  }

  // Detect motion
  if (hasFramer) {
    themes.push("framer-motion");
  }

  // Detect charts
  if (hasRecharts) {
    themes.push("recharts");
  }

  // Detect date libraries
  if (hasDayjs) {
    themes.push("dayjs");
  }

  // Detect markdown
  if (hasMdx) {
    themes.push("mdx");
  }

  // Detect webview technologies
  const webviews: string[] = [];
  if ("electron" in deps) {
    webviews.push("electron");
  }
  if ("tauri" in deps) {
    webviews.push("tauri");
  }
  if ("capacitor" in deps) {
    webviews.push("capacitor");
  }
  if ("react-native" in deps) {
    webviews.push("react-native");
  }

  // Detect custom commands from package.json
  const commands: string[] = [];
  if (packageJson?.scripts) {
    for (const [name, _script] of Object.entries(packageJson.scripts)) {
      if (
        name !== "start" &&
        name !== "build" &&
        name !== "dev" &&
        name !== "test"
      ) {
        commands.push(name);
      }
    }
  }

  // Detect testing frameworks
  const hasTestingFramework = !!(
    hasJest ||
    hasVitest ||
    hasPlaywright ||
    hasCypress ||
    hasBunTest
  );

  // Return the features object
  return {
    i18n: hasNextIntl || hasI18next || hasRosetta,
    analytics:
      hasVercelAnalytics ||
      hasSegmentAnalytics ||
      hasGoogleAnalytics ||
      hasPlausible ||
      hasFathom,
    themeMode: "dark-light",
    authentication:
      hasNextAuth || hasClerk || hasBetterAuth || hasAuth0 || hasSupabase,
    api: hasHono || hasTrpc || hasGraphql || hasRest,
    database:
      hasPrisma ||
      hasDrizzle ||
      hasSupabase ||
      hasMongoose ||
      hasPg ||
      hasMysql ||
      hasSqlite ||
      hasMongo,
    testing: hasTestingFramework,
    docker: hasDocker,
    ci: hasCI,
    commands: commands.slice(0, 10), // Limit to 10 commands to avoid overly large configs
    webview: webviews,
    language: languages,
    themes: themes.slice(0, 20), // Limit to 20 themes to avoid overly large configs
  };
}
