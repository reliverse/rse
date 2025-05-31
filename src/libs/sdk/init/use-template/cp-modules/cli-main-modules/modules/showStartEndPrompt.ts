import { endPrompt, startPrompt } from "@reliverse/rempts";
import { isBun, isBunPM, isBunRuntime } from "@reliverse/runtime";

import { getPkgName, getPkgVersion } from "~/libs/sdk/utils/startEndPrompts";

export async function showStartPrompt(
  isDev: boolean,
  showRuntimeInfo: boolean,
) {
  await startPrompt({
    titleColor: "inverse",
    clearConsole: true,
    packageName: getPkgName(),
    packageVersion: getPkgVersion(),
    isDev,
  });

  if (showRuntimeInfo) {
    console.log("isBunRuntime:", isBunRuntime());
    console.log("isBunPM:", await isBunPM());
    console.log("isBun:", isBun);
  }
}

export async function showEndPrompt() {
  await endPrompt({
    title:
      "│  ❤️  Please consider supporting rse: https://github.com/sponsors/blefnk",
    titleAnimation: "glitch",
    titleColor: "dim",
    titleTypography: "bold",
    titleAnimationDelay: 800,
  });
}
