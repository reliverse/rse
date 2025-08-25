import { defineArgs } from "@reliverse/rempts";
import { msgs } from "./msgs";

export const commonArgs = defineArgs({
  ci: {
    type: "boolean",
    description: msgs.args.ci,
    default: !process.stdout.isTTY || !!process.env.CI,
  },
  dev: {
    type: "boolean",
    description: msgs.args.dev,
  },
  cwd: {
    type: "string",
    description: msgs.args.cwd,
    default: process.cwd(),
  },
});
