import type { Template } from "../better-t-stack-types.ts";

export const DLER_TPL_EXTRAS: Template = {
  name: "extras",
  description: "Template generated from 2 files",
  updatedAt: "2025-06-17T17:18:47.055Z",
  config: {
    files: {
      "extras/pnpm-workspace.yaml": {
        metadata: {
          updatedAt: "2025-05-04T11:48:18.459Z",
          updatedHash: "090aac2656"
        },
        content: `packages:\n  - "apps/*"\n  - "packages/*"\n`,
        type: "text",
      },
      "extras/_npmrc.hbs": {
        metadata: {
          updatedAt: "2025-05-04T11:48:18.441Z",
          updatedHash: "bbf3cc73d5"
        },
        content: `node-linker=hoisted\n{{#if (includes frontend "nuxt")}}\nshamefully-hoist=true\nstrict-peer-dependencies=false\n{{/if}}\n`,
        type: "text",
      }
    },
  },
};
