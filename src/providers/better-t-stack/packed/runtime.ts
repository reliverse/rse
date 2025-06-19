import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_RUNTIME: Template = {
  name: "runtime",
  description: "Template generated from 1 files",
  updatedAt: "2025-06-17T20:33:59.820Z",
  config: {
    files: {
      "runtime/workers/apps/server/wrangler.jsonc.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3dd7199f43",
        },
        content: `{\n  "name": "{{projectName}}-server",\n  "main": "src/index.ts",\n  "compatibility_date": "2025-06-15",\n  "compatibility_flags": ["nodejs_compat"],\n  "vars": {\n    "NODE_ENV": "production"\n    // Non-sensitive environment variables (visible in dashboard)\n    // "CORS_ORIGIN": "https://your-frontend-domain.com",\n    // "BETTER_AUTH_URL": "https://your-worker-domain.workers.dev"\n  }\n  // ⚠️ SENSITIVE DATA: Use \`wrangler secret put\` instead of adding here\n  // Don't put these in "vars" - they'll be visible in the dashboard!\n  // - DATABASE_URL\n  // - DATABASE_AUTH_TOKEN\n  // - GOOGLE_GENERATIVE_AI_API_KEY\n  // - BETTER_AUTH_SECRET\n}\n`,
        type: "text",
      },
    },
  },
};
