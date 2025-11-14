import {
  defineCmd,
  defineCmdArgs,
  defineCmdCfg,
} from "@reliverse/dler-launcher";
import { logger } from "@reliverse/dler-logger";

// import { $ } from "bun";

function shellCmd(args: { x: string }) {
  logger.info(`What AI rules do you want to install?`, args.x);
}

const shellCmdArgs = defineCmdArgs({
  x: {
    type: "string",
    required: true,
    description: "",
  },
});

const shellCmdCfg = defineCmdCfg({
  name: "rules",
  description: "",
  examples: ['rules --x "Hello, Reliverse"'],
});

export default defineCmd(shellCmd, shellCmdArgs, shellCmdCfg);
