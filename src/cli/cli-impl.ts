import { selectPrompt } from "@reliverse/prompts";
import { deleteLastLine } from "@reliverse/prompts";
import { generate } from "random-words";

import type { ParamsOmitSkipPN } from "~/libs/sdk/types/types-mod.js";

import {
  ad,
  getRandomMessage,
  getWelcomeTitle,
  premium,
} from "~/db/messages.js";
import { cliJsrPath, UNKNOWN_VALUE } from "~/libs/cfg/constants/cfg-details.js";
import { aiMenu } from "~/libs/sdk/ai/ai-menu.js";
import { showManualBuilderMenu } from "~/libs/sdk/init/init-impl.js";
import { handleOpenProjectMenu } from "~/libs/sdk/init/manual-mode/deprecated/editor-menu.js";
import { getMainMenuOptions } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/cli-menu-items/getMainMenuOptions.js";
import { showCloneProjectMenu } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/cli-menu-items/showCloneProjectMenu.js";
import { showEndPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt.js";
import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl.js";
import { showNativeCliMenu } from "~/libs/sdk/utils/native-cli/nc-mod.js";
import { detectProject } from "~/libs/sdk/utils/reliverseConfig/rc-detect.js";

import { showNewProjectMenu, showOpenProjectMenu } from "./menu/menu-mod.js";

export async function app(params: ParamsOmitSkipPN) {
  const { cwd, isDev, multireli, memory, config } = params;

  const skipPrompts = config.skipPromptsUseAutoBehavior;
  const frontendUsername = memory.name !== "" ? memory.name : UNKNOWN_VALUE;
  const projectName = isDev
    ? generate({ exactly: 2, join: "-" })
    : config.projectName;

  if (!isDev) {
    const rootProject = await detectProject(cwd, isDev);
    if (rootProject) {
      await handleOpenProjectMenu(
        [rootProject],
        isDev,
        memory,
        cwd,
        true,
        config,
      );
      await showEndPrompt();
      deleteLastLine();
      process.exit(0);
    }
  }

  const options = await getMainMenuOptions(cwd, isDev, multireli);

  const mainMenuOption = await selectPrompt({
    options,
    title: frontendUsername
      ? getWelcomeTitle(frontendUsername)
      : getRandomMessage("welcome"),
    content: `[Ad] ${ad}\n${premium}`,
    titleColor: "retroGradient",
    displayInstructions: true,
    endTitle: "✋ User pressed Ctrl+C, exiting...",
  });

  if (mainMenuOption === "create") {
    await showNewProjectMenu({
      projectName,
      cwd,
      isDev,
      memory,
      config,
      multireli,
      skipPrompts,
    });
  } else if (mainMenuOption === "clone") {
    await showCloneProjectMenu({ isDev, cwd, config, memory });
  } else if (mainMenuOption === "native-cli") {
    // TODO: remove, deprecated
    const outputDir = cliJsrPath;
    await showNativeCliMenu({ outputDir });
  } else if (mainMenuOption === "manual") {
    await showManualBuilderMenu({
      projectName,
      cwd,
      isDev,
      memory,
      config,
      skipPrompts,
    });
  } else if (mainMenuOption === "detected-projects") {
    await showOpenProjectMenu({
      projectName,
      cwd,
      isDev,
      memory,
      config,
      multireli,
      skipPrompts,
    });
  } else if (mainMenuOption === "isDevTools") {
    await showDevToolsMenu({
      projectName,
      cwd,
      isDev,
      config,
      memory,
      skipPrompts,
    });
  } else if (mainMenuOption === "ai") {
    await aiMenu(config, false, memory);
  }

  await showEndPrompt();
}
