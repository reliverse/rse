import { createCli } from "@reliverse/rempts";

await createCli({}); // 'await' has no effect on the type of this expression.ts(80007)

// deprecated
/* await runMain(
  defineCommand({
    // empty object activates file-based
    // commands in the src/app directory
  }),
); */

/**
 * AVAILABLE COMMANDS
 * `dev:add`
 * `dev:ai`
 * `dev:auth`
 * `dev:cli` <— main command (`bun dev` or `rse cli`)
 * `dev:clone`
 * `dev:cmod`
 * `dev:env`
 * `dev:help`
 * `dev:init`
 * `dev:login`
 * `dev:logout`
 * `dev:memory`
 * `dev:mrse`
 * `dev:schema`
 * `dev:studio`
 * `dev:toolbox`
 * `dev:update`
 * `dev:upload`
 */
