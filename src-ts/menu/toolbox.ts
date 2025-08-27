import {
  downloadRepoOption,
  experimental,
  openVercelTools,
  type ReliverseConfig,
  type ReliverseMemory,
  rmTestsRuntime,
  showEndPrompt,
} from "@reliverse/dler";
import { callCmd, selectPrompt } from "@reliverse/rempts";
import { default as aggCmd } from "~/app/agg/cmd";
import { default as buildCmd } from "~/app/build/cmd";
import { default as deployCmd } from "~/app/deploy/cmd";
import { default as publishCmd } from "~/app/publish/cmd";
import { default as updateCmd } from "~/app/update/cmd";
import { msgs } from "~/const";

export async function showToolboxMenu({
  isCI,
  strCwd,
  isDev,
  memory,
  config,
  skipPrompts,
}: {
  isCI: boolean;
  strCwd: string;
  isDev: boolean;
  memory: ReliverseMemory;
  config: ReliverseConfig;
  skipPrompts: boolean;
}) {
  const cmdToRun = await selectPrompt({
    title: "Dev tools menu",
    options: [
      { value: "build", label: msgs.cmds.build },
      { value: "publish", label: msgs.cmds.publish },
      { value: "deploy", label: msgs.cmds.deploy },
      { value: "update", label: msgs.cmds.update },
      { value: "agg", label: msgs.cmds.agg },
      {
        value: "rm-tests-runtime",
        label: "remove tests-runtime dir",
      },
      {
        value: "download-template",
        label: "downloadRepo + cd(tests-runtime) + composeEnvFile + promptGitDeploy",
      },
      {
        value: "open-vercel-tools",
        label: `Open Vercel Toolbox ${experimental}`,
      },
      { value: "exit", label: "👈 Exit" },
    ],
  });

  switch (cmdToRun) {
    case "build": {
      await callCmd(buildCmd, { strCwd, isCI, isDev });
      break;
    }
    case "publish": {
      await callCmd(publishCmd, { strCwd, isCI, isDev });
      break;
    }
    case "deploy": {
      await callCmd(deployCmd, { strCwd, isCI, isDev });
      break;
    }
    case "update": {
      await callCmd(updateCmd, { strCwd, isCI, isDev });
      break;
    }
    case "agg": {
      await callCmd(aggCmd, { strCwd, isCI, isDev });
      break;
    }
    case "rm-tests-runtime": {
      await rmTestsRuntime(strCwd);
      break;
    }
    case "download-template": {
      await downloadRepoOption(
        "blefnk/relivator-nextjs-template",
        config,
        memory,
        isDev,
        strCwd,
        skipPrompts,
      );
      break;
    }
    case "open-vercel-tools": {
      await openVercelTools(memory);
      break;
    }
    default: {
      await showEndPrompt();
      process.exit(0);
    }
  }
}
