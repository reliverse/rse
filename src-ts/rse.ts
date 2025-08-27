import {
  ad,
  aiMenu,
  commonEndActions,
  commonStartActions,
  detectProject,
  detectProjectsWithReliverseConfig,
  getConfigDler,
  getCurrentWorkingDirectory,
  getOrCreateReliverseMemory,
  getRandomMessage,
  getWelcomeTitle,
  premium,
  type ReliverseConfig,
  showCloneProjectMenu,
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
import type { CommonArgs } from "node_modules/@reliverse/dler/bin/app/types/mod";
import { generate } from "random-words";

import { default as nativeCmd } from "./app/native/cmd";
import { msgs } from "./const";
import { showToolboxMenu } from "./menu/toolbox";

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
  const mrse: ReliverseConfig[] = [];
  const multiConfigMsg =
    mrse.length > 0 ? re.dim(`multi-config mode with ${mrse.length} projects`) : "";

  // Detect local projects from the current directory or tests-runtime in dev mode
  const rseSearchPath = isDev ? path.join(strCwd, "tests-runtime") : strCwd;
  let detectedCount = 0;
  if (await fs.pathExists(rseSearchPath)) {
    const detectedProjects = await detectProjectsWithReliverseConfig(rseSearchPath, isDev);
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
      { label: "💬 Open chat with Rse AI", value: "ai" },
      {
        label: "🧰 Open developer toolkit",
        value: "toolbox",
        hint: "build, publish to npm, deploy to vercel, and more",
      },
      {
        label: "👈 Exit",
        value: "exit",
        hint: re.dim("ctrl+c anywhere"),
      },
    ],
  });

  switch (cmdToRun) {
    case "create": {
      await showNewProjectMenu({
        projectName,
        cwd: strCwd,
        isDev,
        memory,
        config,
        mrse,
        skipPrompts,
      });
      break;
    }
    case "clone": {
      await showCloneProjectMenu({ isDev, cwd: strCwd, config, memory });
      break;
    }
    case "manual": {
      await showManualBuilderMenu({
        projectName,
        cwd: strCwd,
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
        cwd: strCwd,
        isDev,
        memory,
        config,
        mrse,
        skipPrompts,
      });
      break;
    }
    case "toolbox": {
      await showToolboxMenu({
        isCI,
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

const main = defineCommand({
  meta: {
    name: "rse",
    description: msgs.cmds.rse,
    version: "1.7.18",
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
    const strCwd = String(cwd);
    await commonStartActions({
      isCI,
      isDev,
      strCwd,
      showRuntimeInfo: false,
      clearConsole: false,
      withStartPrompt: true,
    });

    await showMainMenu({ strCwd, isCI, isDev });

    await commonEndActions({ withEndPrompt: true });
  },
});

await createCli(main);
