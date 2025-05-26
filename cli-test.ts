// TODO: This tests manager file should be able to run all `bun dev:*` commands without any user interaction.

// TODO: Use @reliverse/rempts' await runCmd(await someCmd(), [...args])

/**
 * WHAT SHOULD BE TESTED:
 *
 * [ tested manually **bun dev:cmd** | tested manually **rse cmd** | tested automatically **bun dev:cmd** | command ]
 *
 * - ❌ | ❌ | ❌ | `dev:add`
 * - ❌ | ❌ | ❌ | `dev:auth`
 * - ❌ | ❌ | ❌ | `dev:ai`
 * - ❌ | ❌ | ❌ | `dev:cli` <— main command (`bun dev` or `rse cli`)
 * - ❌ | ❌ | ❌ | `dev:clone`
 * - ❌ | ❌ | ❌ | `dev:cmod`
 * - ❌ | ❌ | ❌ | `dev:env`
 * - ❌ | ❌ | ❌ | `dev:help`
 * - ❌ | ❌ | ❌ | `dev:init`
 * - ❌ | ❌ | ❌ | `dev:login`
 * - ❌ | ❌ | ❌ | `dev:logout`
 * - ❌ | ❌ | ❌ | `dev:memory`
 * - ❌ | ❌ | ❌ | `dev:mrse`
 * - ❌ | ❌ | ❌ | `dev:schema`
 * - ❌ | ❌ | ❌ | `dev:studio`
 * - ❌ | ❌ | ❌ | `dev:toolbox`
 * - ❌ | ❌ | ❌ | `dev:update`
 * - ❌ | ❌ | ❌ | `dev:upload`
 */
async function main() {
  console.log("Not implemented yet");
}

await main();
