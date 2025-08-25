import { showEndPrompt } from "@reliverse/dler";
import { callCmd, createCli, defineArgs, defineCommand, selectPrompt } from "@reliverse/rempts";
import { default as buildCmd } from "./app/build/cmd";
import { commonArgs } from "./impl/args";
import { msgs } from "./impl/msgs";
import type { CommonArgs } from "./impl/types";
import { commonEndActions, commonStartActions } from "./impl/utils";

async function showMainMenu(dev = false) {
  const commonArgs: CommonArgs = { ci: false, dev };

  const cmdToRun = await selectPrompt({
    title: "Select a command to run",
    options: [
      { value: "utils", label: "open utils menu" },
      { value: "exit", label: "exit" },
    ],
  });

  switch (cmdToRun) {
    case "utils": {
      await showUtilsMenu(commonArgs.dev);
      break;
    }
    default: {
      await showEndPrompt();
      process.exit(0);
    }
  }
}

async function showUtilsMenu(dev = false) {
  const commonArgs: CommonArgs = { ci: false, dev };

  const cmdToRun = await selectPrompt({
    title: "Select a command to run",
    content: "💡 Run 'dler <command> --help' to see all available utils",
    options: [
      { value: "build", label: "build project without publishing" },
      // { value: "publish", label: "build and publish project" },
      // { value: "upgrade", label: "upgrade dev tools" },
      // { value: "update", label: "update all deps" },
      // { value: "agg", label: "aggregate" },
      { value: "exit", label: "exit" },
    ],
  });

  switch (cmdToRun) {
    case "build": {
      await callCmd(buildCmd, commonArgs);
      break;
    }
    // case "publish": {
    //   await callCmd(publishCmd, commonArgs);
    //   break;
    // }
    // case "update": {
    //   await callCmd(updateCmd, commonArgs);
    //   break;
    // }
    // case "upgrade": {
    //   await callCmd(upgradeCmd, commonArgs);
    //   break;
    // }
    // case "agg": {
    //   await callCmd(aggCmd, commonArgs);
    //   break;
    // }
    default: {
      await showEndPrompt();
      process.exit(0);
    }
  }
}

const main = defineCommand({
  meta: {
    name: "rse",
    description: msgs.cmds.rse,
    version: "1.7.13",
  },
  args: defineArgs({
    ...commonArgs,
  }),
  run: async ({ args }) => {
    const { ci, dev } = args;

    await commonStartActions({ ci, dev });

    await showMainMenu(dev);

    await commonEndActions();
  },
});

await createCli(main);
