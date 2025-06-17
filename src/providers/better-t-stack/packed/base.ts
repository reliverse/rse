import type { PackageJson } from "pkg-types";

import type { Template } from "../better-t-stack-types.ts";

export const DLER_TPL_BASE: Template = {
  name: "base",
  description: "Template generated from 2 files",
  updatedAt: "2025-06-17T17:18:47.006Z",
  config: {
    files: {
      "base/package.json": {
        metadata: {
          updatedAt: "2025-05-26T13:05:11.492Z",
          updatedHash: "c393861f99"
        },
        content: {
          name: "better-t-stack",
          private: true,
          workspaces: [
            "apps/*",
            "packages/*"
          ],
          scripts: {}} satisfies PackageJson,
        type: "json",
      },
      "base/_gitignore": {
        metadata: {
          updatedAt: "2025-05-04T11:48:16.721Z",
          updatedHash: "9dc3732c65"
        },
        content: `node_modules\n.turbo\n`,
        type: "text",
      }
    },
  },
};
