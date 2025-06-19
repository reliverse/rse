import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_EXTRAS: Template = {
  name: "extras",
  description: "Template generated from 2 files",
  updatedAt: "2025-06-17T20:33:59.690Z",
  config: {
    files: {
      "extras/pnpm-workspace.yaml": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "090aac2656",
        },
        content: `packages:\n  - "apps/*"\n  - "packages/*"\n`,
        type: "text",
      },
      "extras/_npmrc.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "bbf3cc73d5",
        },
        content: `node-linker=hoisted\n{{#if (includes frontend "nuxt")}}\nshamefully-hoist=true\nstrict-peer-dependencies=false\n{{/if}}\n`,
        type: "text",
      },
    },
  },
};
