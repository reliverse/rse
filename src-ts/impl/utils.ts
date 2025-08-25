import { prepareReliverseEnvironment, showEndPrompt, showStartPrompt } from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { msgs } from "./msgs";
import type { CommonArgs } from "./types";

export async function commonStartActions({ ci, dev }: CommonArgs) {
  if (!ci) {
    // TODO: support clearConsole=false
    await showStartPrompt(dev, false);
  }

  if (dev) {
    relinka.log(msgs.info.dev);
  }

  if (!process.versions.bun) {
    relinka.warn(
      "Rse CLI is currently optimized for Bun only. Unexpected behavior may occur with other runtimes.",
    );
    relinka.warn("To avoid issues, it's strongly recommended to install Bun: https://bun.sh/get");
  }

  if (ci) {
    relinka.warn(
      "To proceed in CI mode, use subcommands and their flags: rse --help OR rse <command> --help",
    );
    process.exit(0);
  }

  await prepareReliverseEnvironment(dev, "ts");
}

export async function commonEndActions() {
  await showEndPrompt();
  process.exit(0);
}
