import { re } from "@reliverse/relico";
import { relinka } from "@reliverse/relinka";

import type {
  Database,
  ORM,
  Runtime,
} from "~/libs/sdk/providers/better-t-stack/types";
import type { ProjectConfig } from "~/libs/sdk/providers/better-t-stack/types";

import { getPackageExecutionCommand } from "~/libs/sdk/providers/better-t-stack/utils/get-package-execution-command";

export function displayPostInstallInstructions(
  config: ProjectConfig & { depsInstalled: boolean },
) {
  const {
    database,
    relativePath,
    packageManager,
    depsInstalled,
    orm,
    addons,
    runtime,
    frontend,
    backend,
  } = config;

  const isConvex = backend === "convex";
  const runCmd = packageManager === "npm" ? "npm run" : packageManager;
  const cdCmd = `cd ${relativePath}`;
  const hasHuskyOrBiome =
    addons?.includes("husky") || addons?.includes("biome");

  const databaseInstructions =
    !isConvex && database !== "none"
      ? getDatabaseInstructions(database, orm, runCmd, runtime)
      : "";

  const tauriInstructions = addons?.includes("tauri")
    ? getTauriInstructions(runCmd)
    : "";
  const lintingInstructions = hasHuskyOrBiome
    ? getLintingInstructions(runCmd)
    : "";
  const nativeInstructions =
    frontend?.includes("native-nativewind") ||
    frontend?.includes("native-unistyles")
      ? getNativeInstructions(isConvex)
      : "";
  const pwaInstructions =
    addons?.includes("pwa") &&
    (frontend?.includes("react-router") ||
      frontend?.includes("tanstack-router"))
      ? getPwaInstructions()
      : "";
  const starlightInstructions = addons?.includes("starlight")
    ? getStarlightInstructions(runCmd)
    : "";

  const hasWeb = frontend?.some((f) =>
    [
      "tanstack-router",
      "react-router",
      "next",
      "tanstack-start",
      "nuxt",
      "svelte",
      "solid",
    ].includes(f),
  );
  const hasNative =
    frontend?.includes("native-nativewind") ||
    frontend?.includes("native-unistyles");

  const bunWebNativeWarning =
    packageManager === "bun" && hasNative && hasWeb
      ? getBunWebNativeWarning()
      : "";
  const noOrmWarning =
    !isConvex && database !== "none" && orm === "none" ? getNoOrmWarning() : "";

  const hasReactRouter = frontend?.includes("react-router");
  const hasSvelte = frontend?.includes("svelte");
  const webPort = hasReactRouter || hasSvelte ? "5173" : "3001";

  const tazeCommand = getPackageExecutionCommand(packageManager, "taze -r");

  let output = `${re.bold("Next steps")}\n${re.cyan("1.")} ${cdCmd}\n`;
  let stepCounter = 2;

  if (!depsInstalled) {
    output += `${re.cyan(`${stepCounter++}.`)} ${packageManager} install\n`;
  }

  if (isConvex) {
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev:setup ${re.dim(
      "(this will guide you through Convex project setup)",
    )}\n`;
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n\n`;
  } else {
    if (runtime !== "workers") {
      output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
    }

    if (runtime === "workers") {
      output += `${re.cyan(`${stepCounter++}.`)} bun dev\n`;
      output += `${re.cyan(
        `${stepCounter++}.`,
      )} cd apps/server && bun run cf-typegen\n\n`;
    } else {
      output += "\n";
    }
  }

  output += `${re.bold("Your project will be available at:")}\n`;

  if (hasWeb) {
    output += `${re.cyan("•")} Frontend: http://localhost:${webPort}\n`;
  } else if (!hasNative && !addons?.includes("starlight")) {
    output += `${re.yellow(
      "NOTE:",
    )} You are creating a backend-only app (no frontend selected)\n`;
  }

  if (!isConvex) {
    output += `${re.cyan("•")} Backend API: http://localhost:3000\n`;
  }

  if (addons?.includes("starlight")) {
    output += `${re.cyan("•")} Docs: http://localhost:4321\n`;
  }

  if (nativeInstructions) output += `\n${nativeInstructions.trim()}\n`;
  if (databaseInstructions) output += `\n${databaseInstructions.trim()}\n`;
  if (tauriInstructions) output += `\n${tauriInstructions.trim()}\n`;
  if (lintingInstructions) output += `\n${lintingInstructions.trim()}\n`;
  if (pwaInstructions) output += `\n${pwaInstructions.trim()}\n`;
  if (starlightInstructions) output += `\n${starlightInstructions.trim()}\n`;

  if (noOrmWarning) output += `\n${noOrmWarning.trim()}\n`;
  if (bunWebNativeWarning) output += `\n${bunWebNativeWarning.trim()}\n`;

  output += `\n${re.bold("Update all dependencies:\n")}${re.cyan(
    tazeCommand,
  )}\n\n`;
  output += `${re.bold(
    "Like Better-T Stack?",
  )} Please consider giving us a star on GitHub:\n`;
  output += re.cyan("https://github.com/AmanVarshney01/create-better-t-stack");

  relinka("info", output);
}

function getNativeInstructions(isConvex: boolean): string {
  const envVar = isConvex ? "EXPO_PUBLIC_CONVEX_URL" : "EXPO_PUBLIC_SERVER_URL";
  const exampleUrl = isConvex
    ? "https://<YOUR_CONVEX_URL>"
    : "http://<YOUR_LOCAL_IP>:3000";
  const envFileName = ".env";
  const ipNote = isConvex
    ? "your Convex deployment URL (find after running 'dev:setup')"
    : "your local IP address";

  let instructions = `${re.yellow(
    "NOTE:",
  )} For Expo connectivity issues, update apps/native/${envFileName} \nwith ${ipNote}:\n${`${envVar}=${exampleUrl}`}\n`;

  if (isConvex) {
    instructions += `\n${re.yellow(
      "IMPORTANT:",
    )} When using local development with Convex and native apps, ensure you use your local IP address \ninstead of localhost or 127.0.0.1 for proper connectivity.\n`;
  }

  return instructions;
}

function getLintingInstructions(runCmd?: string): string {
  return `${re.bold("Linting and formatting:")}\n${re.cyan(
    "•",
  )} Format and lint fix: ${`${runCmd} check`}\n`;
}

function getDatabaseInstructions(
  database: Database,
  orm?: ORM,
  runCmd?: string,
  runtime?: Runtime,
): string {
  const instructions = [];

  if (orm === "prisma") {
    if (database === "sqlite") {
      instructions.push(
        `${re.yellow(
          "NOTE:",
        )} Turso support with Prisma is in Early Access and requires additional setup.`,
        `${"Learn more at: https://www.prisma.io/docs/orm/overview/databases/turso"}`,
      );
    }

    if (runtime === "bun") {
      instructions.push(
        `${re.yellow(
          "NOTE:",
        )} Prisma with Bun may require additional configuration. If you encounter errors,\nfollow the guidance provided in the error messages`,
      );
    }

    instructions.push(`${re.cyan("•")} Apply schema: ${`${runCmd} db:push`}`);
    instructions.push(`${re.cyan("•")} Database UI: ${`${runCmd} db:studio`}`);
  } else if (orm === "drizzle") {
    instructions.push(`${re.cyan("•")} Apply schema: ${`${runCmd} db:push`}`);
    instructions.push(`${re.cyan("•")} Database UI: ${`${runCmd} db:studio`}`);
    if (database === "sqlite") {
      instructions.push(
        `${re.cyan(
          "•",
        )} Start local DB (if needed): ${`cd apps/server && ${runCmd} db:local`}`,
      );
    }
  } else if (orm === "none") {
    instructions.push(
      `${re.yellow("NOTE:")} Manual database schema setup required.`,
    );
  }

  return instructions.length
    ? `${re.bold("Database commands:")}\n${instructions.join("\n")}`
    : "";
}

function getTauriInstructions(runCmd?: string): string {
  return `\n${re.bold("Desktop app with Tauri:")}\n${re.cyan(
    "•",
  )} Start desktop app: ${`cd apps/web && ${runCmd} desktop:dev`}\n${re.cyan(
    "•",
  )} Build desktop app: ${`cd apps/web && ${runCmd} desktop:build`}\n${re.yellow(
    "NOTE:",
  )} Tauri requires Rust and platform-specific dependencies.\nSee: ${"https://v2.tauri.app/start/prerequisites/"}`;
}

function getPwaInstructions(): string {
  return `\n${re.bold("PWA with React Router v7:")}\n${re.yellow(
    "NOTE:",
  )} There is a known compatibility issue between VitePWA and React Router v7.\nSee: https://github.com/vite-pwa/vite-plugin-pwa/issues/809`;
}

function getStarlightInstructions(runCmd?: string): string {
  return `\n${re.bold("Documentation with Starlight:")}\n${re.cyan(
    "•",
  )} Start docs site: ${`cd apps/docs && ${runCmd} dev`}\n${re.cyan(
    "•",
  )} Build docs site: ${`cd apps/docs && ${runCmd} build`}`;
}

function getNoOrmWarning(): string {
  return `\n${re.yellow(
    "WARNING:",
  )} Database selected without an ORM. Features requiring database access (e.g., examples, auth) need manual setup.`;
}

function getBunWebNativeWarning(): string {
  return `\n${re.yellow(
    "WARNING:",
  )} 'bun' might cause issues with web + native apps in a monorepo. Use 'pnpm' if problems arise.`;
}
