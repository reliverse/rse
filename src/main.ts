import { defineCommand, errorHandler, runMain } from "@reliverse/prompts";

import { cliDomainDocs, cliVersion } from "./libs/cfg/constants/cfg-details.js";

const main = defineCommand({
  meta: {
    name: "reliverse",
    version: cliVersion,
    description: cliDomainDocs,
  },
  subCommands: {
    cli: () => import("./app/app-mod.js").then((r) => r.default),
    ai: () => import("./arg/ai/ai-mod.js").then((r) => r.default),
    help: () => import("./arg/help/help-mod.js").then((r) => r.default),
    login: () => import("./arg/login/login-mod.js").then((r) => r.default),
    logout: () => import("./arg/logout/logout-mod.js").then((r) => r.default),
    schema: () => import("./arg/schema/schema-mod.js").then((r) => r.default),
    memory: () => import("./arg/memory/memory-mod.js").then((r) => r.default),
    studio: () => import("./arg/studio/studio-mod.js").then((r) => r.default),
    update: () => import("./arg/update/update-mod.js").then((r) => r.default),
    upload: () => import("./arg/upload/upload-mod.js").then((r) => r.default),
    rules: () =>
      import("./arg/ai/ai-impl/rules/rules-mod.js").then((r) => r.default),
    env: () => import("./arg/env/env-mod.js").then((r) => r.default),
    multireli: () =>
      import("./arg/multireli/multireli-mod.js").then((r) => r.default),
  },
});

if (import.meta.main) {
  await runMain(main).catch((error: unknown) => {
    errorHandler(
      error instanceof Error ? error : new Error(String(error)),
      "An unhandled error occurred, please report it at https://github.com/reliverse/cli",
    );
  });
}
