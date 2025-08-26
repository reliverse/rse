import {
  ad,
  aiMenu,
  detectProject,
  detectProjectsWithRseConfig,
  getConfigDler,
  getCurrentWorkingDirectory,
  getOrCreateReliverseMemory,
  getRandomMessage,
  getWelcomeTitle,
  premium,
  type RseConfig,
  showCloneProjectMenu,
  showDevToolsMenu,
  showEndPrompt,
  showManualBuilderMenu,
  showNewProjectMenu,
  showOpenProjectMenu,
  UNKNOWN_VALUE,
} from "@reliverse/dler";
import path from "@reliverse/pathkit";
import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { callCmd, createCli, defineArgs, defineCommand, selectPrompt } from "@reliverse/rempts";
import { generate } from "random-words";
import { default as aggCmd } from "./app/agg/cmd";
import { default as buildCmd } from "./app/build/cmd";
import { default as deployCmd } from "./app/deploy/cmd";
import { default as nativeCmd } from "./app/native/cmd";
import { default as publishCmd } from "./app/publish/cmd";
import { default as updateCmd } from "./app/update/cmd";
import { msgs } from "./impl/msgs";
import type { CommonArgs } from "./impl/types";
import { commonEndActions, commonStartActions } from "./impl/utils";

async function showMainMenu({ strCwd, isCI, isDev }: CommonArgs) {
  const memory = await getOrCreateReliverseMemory();

  // await authCheck(isDev, memory, useLocalhost);
  // Get fresh memory after auth check
  // const updatedMemory = await getOrCreateReliverseMemory();

  const config = await getConfigDler();

  const skipPrompts = config.skipPromptsUseAutoBehavior ?? false;
  const frontendUsername = memory.name !== "" ? memory.name : UNKNOWN_VALUE;
  const projectName = isDev
    ? generate({ exactly: 2, join: "-" })
    : (config.projectName ?? UNKNOWN_VALUE);

  await detectProject(strCwd, isDev);

  // Initial multi-config hint (if relevant)
  const mrse: RseConfig[] = [];
  const multiConfigMsg =
    mrse.length > 0 ? re.dim(`multi-config mode with ${mrse.length} projects`) : "";

  // Detect local projects from the current directory or tests-runtime in dev mode
  const rseSearchPath = isDev ? path.join(strCwd, "tests-runtime") : strCwd;
  let detectedCount = 0;
  if (await fs.pathExists(rseSearchPath)) {
    const detectedProjects = await detectProjectsWithRseConfig(rseSearchPath, isDev);
    detectedCount = detectedProjects.length;
  }

  // Show "Detected: N" if we have any local projects
  const detectedHint = detectedCount > 0 ? `Detected: ${detectedCount}` : "";

  const cmdToRun = await selectPrompt({
    title: frontendUsername ? getWelcomeTitle(frontendUsername) : getRandomMessage("welcome"),
    content: `[Ad] ${ad}\n${premium}`,
    titleColor: "retroGradient",
    displayInstructions: true,
    endTitle: "✋ User pressed Ctrl+C, exiting...",
    options: [
      { value: "utils", label: "open utils menu" },

      {
        label: "✨ Create a project in terminal",
        hint: multiConfigMsg,
        value: "create",
      },
      {
        label: "💻 Open rse app ui",
        hint: "experimental",
        value: "app-ui",
      },
      {
        label: "🔬 Create/edit project manually",
        // Inject "Detected: N" near the manual creation if we found any
        hint: [multiConfigMsg, detectedHint].filter(Boolean).join(" | "),
        value: "manual",
      },
      {
        label: "🔍 Open detected projects",
        value: "detected-projects",
      },
      {
        label: "🧱 Clone an existing repository",
        hint: multiConfigMsg,
        value: "clone",
      },
      { label: "💬 Chat with Reliverse AI", value: "ai" },
      {
        label: "🧰 Open developer toolkit",
        value: "devTools",
      },
      {
        label: "👈 Exit",
        value: "exit",
        hint: re.dim("ctrl+c anywhere"),
      },
    ],
  });

  switch (cmdToRun) {
    case "utils": {
      await showUtilsMenu({ strCwd, isCI, isDev });
      break;
    }
    case "create": {
      await showNewProjectMenu({
        projectName,
        strCwd,
        isDev,
        memory,
        config,
        mrse,
        skipPrompts,
      });
      break;
    }
    case "clone": {
      await showCloneProjectMenu({ isDev, strCwd, config, memory });
      break;
    }
    case "manual": {
      await showManualBuilderMenu({
        projectName,
        strCwd,
        isDev,
        memory,
        config,
        skipPrompts,
      });
      break;
    }
    case "detected-projects": {
      await showOpenProjectMenu({
        projectName,
        strCwd,
        isDev,
        memory,
        config,
        mrse,
        skipPrompts,
      });
      break;
    }
    case "devTools": {
      await showDevToolsMenu({
        projectName,
        strCwd,
        isDev,
        config,
        memory,
        skipPrompts,
      });
      break;
    }
    case "ai": {
      await aiMenu(config, false, memory);
      break;
    }
    case "app-ui": {
      await callCmd(nativeCmd, {}); // TODO: launch rse app ui
      break;
    }
    default: {
      await showEndPrompt();
      process.exit(0);
    }
  }
}

async function showUtilsMenu({ strCwd, isCI, isDev }: CommonArgs) {
  const cmdToRun = await selectPrompt({
    title: "Select an utility to run",
    options: [
      { value: "build", label: msgs.cmds.build },
      { value: "publish", label: msgs.cmds.publish },
      { value: "deploy", label: msgs.cmds.deploy },
      { value: "update", label: msgs.cmds.update },
      { value: "agg", label: msgs.cmds.agg },
      { value: "exit", label: "exit" },
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
    // Common args
    ci: {
      type: "boolean",
      description: msgs.args.ci,
      default: !process.stdout.isTTY || !!process.env["CI"],
    },
    cwd: {
      type: "string",
      description: msgs.args.cwd,
      default: getCurrentWorkingDirectory(),
    },
    dev: {
      type: "boolean",
      description: msgs.args.dev,
    },
    // Command specific args
    // ...
  }),
  run: async ({ args }) => {
    const { ci, cwd, dev } = args;
    const isCI = Boolean(ci);
    const isDev = Boolean(dev);
    const workDir = String(cwd);
    await commonStartActions({ strCwd, isCI, isDev });

    await showMainMenu({ strCwd, isCI, isDev });

    await commonEndActions();
  },
});

await createCli(main);
