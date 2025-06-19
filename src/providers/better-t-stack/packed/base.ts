import type { PackageJson } from "pkg-types";

import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_BASE: Template = {
  name: "base",
  description: "Template generated from 2 files",
  updatedAt: "2025-06-17T20:33:59.621Z",
  config: {
    files: {
      "base/package.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f278e38033",
        },
        content: {
          name: "better-t-stack",
          private: true,
          workspaces: ["apps/*", "packages/*"],
          scripts: {},
        } satisfies PackageJson,
        type: "json",
      },
      "base/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9dc3732c65",
        },
        content: `node_modules\n.turbo\n`,
        type: "text",
      },
    },
  },
};
