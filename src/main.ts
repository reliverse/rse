import { defineCommand, errorHandler, runMain } from "@reliverse/prompts";

import { cliDomainDocs, cliVersion } from "./libs/cfg/constants/cfg-details.js";

const main = defineCommand({
  meta: {
    name: "reliverse",
    version: cliVersion,
    description: cliDomainDocs,
  },
  subCommands: {
    cli: () => import("./cli/cli-mod.js").then((r) => r.default),
    add: () => import("./cli/args/arg-add.js").then((r) => r.default),
    ai: () => import("./cli/args/arg-ai.js").then((r) => r.default),
    clone: () => import("./cli/args/arg-clone.js").then((r) => r.default),
    cmod: () => import("./cli/args/arg-cmod.js").then((r) => r.default),
    env: () => import("./cli/args/arg-env.js").then((r) => r.default),
    help: () => import("./cli/args/arg-help.js").then((r) => r.default),
    init: () => import("./cli/args/arg-init.js").then((r) => r.default),
    login: () => import("./cli/args/arg-login.js").then((r) => r.default),
    logout: () => import("./cli/args/arg-logout.js").then((r) => r.default),
    memory: () => import("./cli/args/arg-memory.js").then((r) => r.default),
    multireli: () =>
      import("./cli/args/arg-multireli.js").then((r) => r.default),
    schema: () => import("./cli/args/arg-schema.js").then((r) => r.default),
    studio: () => import("./cli/args/arg-studio.js").then((r) => r.default),
    update: () => import("./cli/args/arg-update.js").then((r) => r.default),
    upload: () => import("./cli/args/arg-upload.js").then((r) => r.default),
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
