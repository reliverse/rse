// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { re } from "@reliverse/dler-colors";
import { logger } from "@reliverse/dler-logger";
import type {
  Database,
  DatabaseSetup,
  ORM,
  ProjectConfig,
  Runtime,
} from "../../types";
import { getDockerStatus } from "../../utils/docker-utils";
export async function displayPostInstallInstructions(
  config: ProjectConfig & { depsInstalled: boolean },
) {
  const {
    api,
    database,
    relativePath,
    packageManager,
    depsInstalled,
    orm,
    addons,
    runtime,
    frontend,
    backend,
    dbSetup,
    webDeploy,
    serverDeploy,
  } = config;

  const isConvex = backend === "convex";
  const isBackendSelf = backend === "self";
  const runCmd =
    packageManager === "npm"
      ? "npm run"
      : packageManager === "pnpm"
        ? "pnpm run"
        : "bun run";
  const cdCmd = `cd ${relativePath}`;
  const hasHuskyOrBiome =
    addons?.includes("husky") || addons?.includes("biome");

  const databaseInstructions =
    !isConvex && database !== "none"
      ? await getDatabaseInstructions(
          database,
          orm,
          runCmd,
          runtime,
          dbSetup,
          serverDeploy,
          backend,
        )
      : "";

  const tauriInstructions = addons?.includes("tauri")
    ? getTauriInstructions(runCmd)
    : "";
  const lintingInstructions = hasHuskyOrBiome
    ? getLintingInstructions(runCmd)
    : "";
  const nativeInstructions =
    frontend?.includes("native-bare") ||
    frontend?.includes("native-uniwind") ||
    frontend?.includes("native-unistyles")
      ? getNativeInstructions(isConvex, isBackendSelf, frontend || [])
      : "";
  const pwaInstructions =
    addons?.includes("pwa") && frontend?.includes("react-router")
      ? getPwaInstructions()
      : "";
  const starlightInstructions = addons?.includes("starlight")
    ? getStarlightInstructions(runCmd)
    : "";
  const clerkInstructions =
    isConvex && config.auth === "clerk" ? getClerkInstructions() : "";
  const polarInstructions =
    config.payments === "polar" && config.auth === "better-auth"
      ? getPolarInstructions(backend)
      : "";
  const wranglerDeployInstructions = getWranglerDeployInstructions(
    runCmd,
    webDeploy,
    serverDeploy,
    backend,
  );
  const alchemyDeployInstructions = getAlchemyDeployInstructions(
    runCmd,
    webDeploy,
    serverDeploy,
    backend,
  );

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
    frontend?.includes("native-bare") ||
    frontend?.includes("native-uniwind") ||
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

  let output = `${re.bold("Next steps")}\n${re.cyan("1.")} ${cdCmd}\n`;
  let stepCounter = 2;

  if (!depsInstalled) {
    output += `${re.cyan(`${stepCounter++}.`)} ${packageManager} install\n`;
  }

  if (
    database === "sqlite" &&
    dbSetup === "none" &&
    (serverDeploy === "wrangler" ||
      serverDeploy === "alchemy" ||
      webDeploy === "wrangler" ||
      webDeploy === "alchemy")
  ) {
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} db:local\n${re.dim(
      "   (starts local SQLite server for Workers compatibility)",
    )}\n`;
  }

  if (isConvex) {
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev:setup\n${re.dim(
      "   (this will guide you through Convex project setup)",
    )}\n`;

    output += `${re.cyan(
      `${stepCounter++}.`,
    )} Copy environment variables from\n${re.white(
      "   packages/backend/.env.local",
    )} to ${re.white("apps/*/.env")}\n`;
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n\n`;
  } else if (isBackendSelf) {
    output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
  } else {
    if (runtime !== "workers") {
      output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
    }

    if (runtime === "workers") {
      if (dbSetup === "d1") {
        output += `${re.yellow(
          "IMPORTANT:",
        )} Complete D1 database setup first\n   (see Database commands below)\n`;
      }
      output += `${re.cyan(`${stepCounter++}.`)} ${runCmd} dev\n`;
      if (serverDeploy === "wrangler") {
        output += `${re.cyan(`${stepCounter++}.`)} cd apps/server && ${runCmd} cf-typegen\n`;
      }
    }
  }

  output += `${re.bold("Your project will be available at:")}\n`;

  if (hasWeb) {
    output += `${re.cyan("•")} Frontend: http://localhost:${webPort}\n`;
  } else if (!hasNative && !addons?.includes("starlight")) {
    output += `${re.yellow(
      "NOTE:",
    )} You are creating a backend-only app\n   (no frontend selected)\n`;
  }

  if (!isConvex && !isBackendSelf) {
    output += `${re.cyan("•")} Backend API: http://localhost:3000\n`;

    if (api === "orpc") {
      output += `${re.cyan("•")} OpenAPI (Scalar UI): http://localhost:3000/api-reference\n`;
    }
  }

  if (isBackendSelf && api === "orpc") {
    output += `${re.cyan("•")} OpenAPI (Scalar UI): http://localhost:${webPort}/api/rpc/api-reference\n`;
  }

  if (addons?.includes("starlight")) {
    output += `${re.cyan("•")} Docs: http://localhost:4321\n`;
  }

  if (addons?.includes("fumadocs")) {
    output += `${re.cyan("•")} Fumadocs: http://localhost:4000\n`;
  }

  if (nativeInstructions) output += `\n${nativeInstructions.trim()}\n`;
  if (databaseInstructions) output += `\n${databaseInstructions.trim()}\n`;
  if (tauriInstructions) output += `\n${tauriInstructions.trim()}\n`;
  if (lintingInstructions) output += `\n${lintingInstructions.trim()}\n`;
  if (pwaInstructions) output += `\n${pwaInstructions.trim()}\n`;
  if (wranglerDeployInstructions)
    output += `\n${wranglerDeployInstructions.trim()}\n`;
  if (alchemyDeployInstructions)
    output += `\n${alchemyDeployInstructions.trim()}\n`;
  if (starlightInstructions) output += `\n${starlightInstructions.trim()}\n`;
  if (clerkInstructions) output += `\n${clerkInstructions.trim()}\n`;
  if (polarInstructions) output += `\n${polarInstructions.trim()}\n`;

  if (noOrmWarning) output += `\n${noOrmWarning.trim()}\n`;
  if (bunWebNativeWarning) output += `\n${bunWebNativeWarning.trim()}\n`;

  output += `\n${re.bold(
    "Like Better-T-Stack?",
  )} Please consider giving us a star\n   on GitHub:\n`;
  output += re.cyan("https://github.com/AmanVarshney01/create-better-t-stack");

  logger.info(output);
}

function getNativeInstructions(
  isConvex: boolean,
  isBackendSelf: boolean,
  _frontend: string[],
) {
  const envVar = isConvex ? "EXPO_PUBLIC_CONVEX_URL" : "EXPO_PUBLIC_SERVER_URL";
  const exampleUrl = isConvex
    ? "https://<YOUR_CONVEX_URL>"
    : isBackendSelf
      ? "http://<YOUR_LOCAL_IP>:3001"
      : "http://<YOUR_LOCAL_IP>:3000";
  const envFileName = ".env";
  const ipNote = isConvex
    ? "your Convex deployment URL (find after running 'dev:setup')"
    : "your local IP address";

  let instructions = `${re.yellow(
    "NOTE:",
  )} For Expo connectivity issues, update\n   apps/native/${envFileName} with ${ipNote}:\n   ${`${envVar}=${exampleUrl}`}\n`;

  if (isConvex) {
    instructions += `\n${re.yellow(
      "IMPORTANT:",
    )} When using local development with Convex and native apps,\n   ensure you use your local IP address instead of localhost or 127.0.0.1\n   for proper connectivity.\n`;
  }

  return instructions;
}

function getLintingInstructions(runCmd?: string) {
  return `${re.bold("Linting and formatting:")}\n${re.cyan(
    "•",
  )} Format and lint fix: ${`${runCmd} check`}\n`;
}

async function getDatabaseInstructions(
  database: Database,
  orm?: ORM,
  runCmd?: string,
  runtime?: Runtime,
  dbSetup?: DatabaseSetup,
  serverDeploy?: string,
  backend?: string,
) {
  const instructions: string[] = [];

  if (dbSetup === "docker") {
    const dockerStatus = await getDockerStatus(database);

    if (dockerStatus.message) {
      instructions.push(dockerStatus.message);
      instructions.push("");
    }
  }

  if (serverDeploy === "wrangler" && dbSetup === "d1") {
    if (orm === "prisma" && runtime === "workers") {
      instructions.push(
        `\n${re.yellow(
          "WARNING:",
        )} Prisma + D1 on Workers with Wrangler has migration issues.\n   Consider using Alchemy deploy instead of Wrangler for D1 projects.\n`,
      );
    }
    const packageManager = runCmd === "npm run" ? "npm" : runCmd || "npm";

    instructions.push(
      `${re.cyan("1.")} Login to Cloudflare: ${re.white(
        `${packageManager} wrangler login`,
      )}`,
    );
    instructions.push(
      `${re.cyan("2.")} Create D1 database: ${re.white(
        `${packageManager} wrangler d1 create your-database-name`,
      )}`,
    );
    const wranglerPath = backend === "self" ? "apps/web" : "apps/server";
    instructions.push(
      `${re.cyan(
        "3.",
      )} Update ${wranglerPath}/wrangler.jsonc with database_id and database_name`,
    );
    instructions.push(
      `${re.cyan("4.")} Generate migrations: ${re.white(
        `cd ${wranglerPath} && ${runCmd} db:generate`,
      )}`,
    );
    instructions.push(
      `${re.cyan("5.")} Apply migrations locally: ${re.white(
        `${packageManager} wrangler d1 migrations apply YOUR_DB_NAME --local`,
      )}`,
    );
    instructions.push(
      `${re.cyan("6.")} Apply migrations to production: ${re.white(
        `${packageManager} wrangler d1 migrations apply YOUR_DB_NAME`,
      )}`,
    );
  }

  if (dbSetup === "d1" && serverDeploy === "alchemy") {
    if (orm === "drizzle") {
      instructions.push(
        `${re.yellow(
          "NOTE:",
        )} D1 migrations are automatically handled by Alchemy`,
      );
    } else if (orm === "prisma") {
      instructions.push(
        `${re.cyan("•")} Generate migrations: ${`${runCmd} db:generate`}`,
      );
      instructions.push(
        `${re.cyan("•")} Apply migrations: ${`${runCmd} db:migrate`}`,
      );
    }
  }

  if (dbSetup === "planetscale") {
    if (database === "mysql" && orm === "drizzle") {
      instructions.push(
        `${re.yellow(
          "NOTE:",
        )} Enable foreign key constraints in PlanetScale database settings`,
      );
    }
    if (database === "mysql" && orm === "prisma") {
      instructions.push(
        `${re.yellow(
          "NOTE:",
        )} How to handle Prisma migrations with PlanetScale:\n   https://github.com/prisma/prisma/issues/7292`,
      );
    }
  }

  if (orm === "prisma") {
    if (database === "mongodb" && dbSetup === "docker") {
      instructions.push(
        `${re.yellow(
          "WARNING:",
        )} Prisma + MongoDB + Docker combination\n   may not work.`,
      );
    }
    if (dbSetup === "docker") {
      instructions.push(
        `${re.cyan("•")} Start docker container: ${`${runCmd} db:start`}`,
      );
    }
    if (!(dbSetup === "d1" && serverDeploy === "alchemy")) {
      instructions.push(`${re.cyan("•")} Apply schema: ${`${runCmd} db:push`}`);
    }
    if (!(dbSetup === "d1" && serverDeploy === "alchemy")) {
      instructions.push(
        `${re.cyan("•")} Database UI: ${`${runCmd} db:studio`}`,
      );
    }
  } else if (orm === "drizzle") {
    if (dbSetup === "docker") {
      instructions.push(
        `${re.cyan("•")} Start docker container: ${`${runCmd} db:start`}`,
      );
    }
    if (dbSetup !== "d1") {
      instructions.push(`${re.cyan("•")} Apply schema: ${`${runCmd} db:push`}`);
    }
    if (!(dbSetup === "d1" && serverDeploy === "alchemy")) {
      instructions.push(
        `${re.cyan("•")} Database UI: ${`${runCmd} db:studio`}`,
      );
    }
  } else if (orm === "mongoose") {
    if (dbSetup === "docker") {
      instructions.push(
        `${re.cyan("•")} Start docker container: ${`${runCmd} db:start`}`,
      );
    }
  } else if (orm === "none") {
    instructions.push(
      `${re.yellow("NOTE:")} Manual database schema setup\n   required.`,
    );
  }

  return instructions.length
    ? `${re.bold("Database commands:")}\n${instructions.join("\n")}`
    : "";
}

function getTauriInstructions(runCmd?: string) {
  return `\n${re.bold("Desktop app with Tauri:")}\n${re.cyan(
    "•",
  )} Start desktop app: ${`cd apps/web && ${runCmd} desktop:dev`}\n${re.cyan(
    "•",
  )} Build desktop app: ${`cd apps/web && ${runCmd} desktop:build`}\n${re.yellow(
    "NOTE:",
  )} Tauri requires Rust and platform-specific dependencies.\n   See: ${"https://v2.tauri.app/start/prerequisites/"}`;
}

function getPwaInstructions() {
  return `\n${re.bold("PWA with React Router v7:")}\n${re.yellow(
    "NOTE:",
  )} There is a known compatibility issue between VitePWA\n   and React Router v7. See:\n   https://github.com/vite-pwa/vite-plugin-pwa/issues/809`;
}

function getStarlightInstructions(runCmd?: string) {
  return `\n${re.bold("Documentation with Starlight:")}\n${re.cyan(
    "•",
  )} Start docs site: ${`cd apps/docs && ${runCmd} dev`}\n${re.cyan(
    "•",
  )} Build docs site: ${`cd apps/docs && ${runCmd} build`}`;
}

function getNoOrmWarning() {
  return `\n${re.yellow(
    "WARNING:",
  )} Database selected without an ORM. Features requiring\n   database access (e.g., examples, auth) need manual setup.`;
}

function getBunWebNativeWarning() {
  return `\n${re.yellow(
    "WARNING:",
  )} 'bun' might cause issues with web + native apps in a monorepo.\n   Use 'pnpm' if problems arise.`;
}

function getWranglerDeployInstructions(
  runCmd?: string,
  webDeploy?: string,
  serverDeploy?: string,
  backend?: string,
) {
  const instructions: string[] = [];

  if (webDeploy === "wrangler") {
    const deployPath = backend === "self" ? "apps/web" : "apps/web";
    instructions.push(
      `${re.bold("Deploy web to Cloudflare Workers:")}\n${re.cyan("•")} Deploy: ${`cd ${deployPath} && ${runCmd} deploy`}`,
    );
  }
  if (serverDeploy === "wrangler" && backend !== "self") {
    instructions.push(
      `${re.bold("Deploy server to Cloudflare Workers:")}\n${re.cyan("•")} Deploy: ${`cd apps/server && ${runCmd} deploy`}`,
    );
  }

  return instructions.length ? `\n${instructions.join("\n")}` : "";
}

function getClerkInstructions() {
  return `${re.bold("Clerk Authentication Setup:")}\n${re.cyan("•")} Follow the guide: ${re.underline("https://docs.convex.dev/auth/clerk")}\n${re.cyan("•")} Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard\n${re.cyan("•")} Set CLERK_PUBLISHABLE_KEY in apps/*/.env`;
}

function getPolarInstructions(backend?: string) {
  const envPath = backend === "self" ? "apps/web/.env" : "apps/server/.env";
  return `${re.bold("Polar Payments Setup:")}\n${re.cyan("•")} Get access token & product ID from ${re.underline("https://sandbox.polar.sh/")}\n${re.cyan("•")} Set POLAR_ACCESS_TOKEN in ${envPath}`;
}

function getAlchemyDeployInstructions(
  runCmd?: string,
  webDeploy?: string,
  serverDeploy?: string,
  backend?: string,
) {
  const instructions: string[] = [];
  const isBackendSelf = backend === "self";

  if (webDeploy === "alchemy" && serverDeploy !== "alchemy") {
    instructions.push(
      `${re.bold("Deploy web with Alchemy:")}\n${re.cyan("•")} Dev: ${`cd apps/web && ${runCmd} dev`}\n${re.cyan("•")} Deploy: ${`cd apps/web && ${runCmd} deploy`}\n${re.cyan("•")} Destroy: ${`cd apps/web && ${runCmd} destroy`}`,
    );
  } else if (
    serverDeploy === "alchemy" &&
    webDeploy !== "alchemy" &&
    !isBackendSelf
  ) {
    instructions.push(
      `${re.bold("Deploy server with Alchemy:")}\n${re.cyan("•")} Dev: ${`cd apps/server && ${runCmd} dev`}\n${re.cyan("•")} Deploy: ${`cd apps/server && ${runCmd} deploy`}\n${re.cyan("•")} Destroy: ${`cd apps/server && ${runCmd} destroy`}`,
    );
  } else if (
    webDeploy === "alchemy" &&
    (serverDeploy === "alchemy" || isBackendSelf)
  ) {
    instructions.push(
      `${re.bold("Deploy with Alchemy:")}\n${re.cyan("•")} Dev: ${`${runCmd} dev`}\n${re.cyan("•")} Deploy: ${`${runCmd} deploy`}\n${re.cyan("•")} Destroy: ${`${runCmd} destroy`}`,
    );
  }

  return instructions.length ? `\n${instructions.join("\n")}` : "";
}
