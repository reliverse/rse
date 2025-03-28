// rules-mod.ts

import { ensuredir } from "@reliverse/fs";
import { defineCommand } from "@reliverse/prompts";
import os from "os";
import path from "pathe";

import { showRulesMenu, handleDirectRules } from "./add-rule-impl.js";

export default defineCommand({
  meta: {
    name: "rule",
    description: "Download and manage AI IDE rules",
  },
  args: {
    dev: {
      type: "boolean",
      description: "Run in development mode",
      required: false,
      default: false,
    },
    source: {
      type: "string",
      description:
        "Source of the rules | Accepted: `official`, `community`, `prompt`",
      default: "prompt",
    },
    get: {
      type: "string", // TODO: support array
      description:
        "Specify rule files by name or pass `all` to install everything without prompt",
      required: false,
    },
  },
  async run({ args }) {
    const { dev: isDev, source, get } = args;
    const effectiveGet = get ? [get] : [];

    if (
      source !== "prompt" &&
      source !== "official" &&
      source !== "community"
    ) {
      throw new Error(
        "Invalid source. Accepted values: `prompt`, `official`, `community`",
      );
    }

    const homeDir = os.homedir();
    const rulesBaseDir = path.join(homeDir, ".reliverse", "rules");
    await ensuredir(rulesBaseDir);

    if (effectiveGet && effectiveGet.length > 0) {
      // We have direct rule names or `all`, so skip the interactive menu:
      await handleDirectRules({
        cwd: process.cwd(),
        isDev,
        source,
        ruleNames: effectiveGet,
      });
    } else {
      // Show the usual interactive prompts
      await showRulesMenu({
        cwd: process.cwd(),
        isDev,
        source,
      });
    }

    process.exit(0);
  },
});
