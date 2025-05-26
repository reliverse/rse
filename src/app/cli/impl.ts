import { selectPrompt } from "@reliverse/rempts";
import { deleteLastLine } from "@reliverse/rempts";
import { generate } from "random-words";

import type { ParamsOmitSkipPN } from "~/libs/sdk/sdk-types";

import { ad, getRandomMessage, getWelcomeTitle, premium } from "~/db/messages";
import { aiMenu } from "~/libs/sdk/ai/ai-menu";
import { showManualBuilderMenu } from "~/libs/sdk/init/init-impl";
import { handleOpenProjectMenu } from "~/libs/sdk/init/manual-mode/deprecated/editor-menu";
import { getMainMenuOptions } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/cli-menu-items/getMainMenuOptions";
import { showCloneProjectMenu } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/cli-menu-items/showCloneProjectMenu";
import { showEndPrompt } from "~/libs/sdk/init/use-template/cp-modules/cli-main-modules/modules/showStartEndPrompt";
import { showDevToolsMenu } from "~/libs/sdk/toolbox/toolbox-impl";
import { showNativeCliMenu } from "~/libs/sdk/utils/native-cli/nc-mod";
import {
  cliJsrPath,
  UNKNOWN_VALUE,
} from "~/libs/sdk/utils/rseConfig/cfg-details";
import { detectProject } from "~/libs/sdk/utils/rseConfig/rc-detect";
import {
  showNewProjectMenu,
  showOpenProjectMenu,
} from "~/providers/reliverse-stack/rs-mod";

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
