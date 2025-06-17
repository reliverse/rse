import type { Template } from "../better-t-stack-types.ts";

export const DLER_TPL_ADDONS: Template = {
  name: "addons",
  description: "Template generated from 5 files",
  updatedAt: "2025-06-17T17:18:46.916Z",
  config: {
    files: {
      "addons/biome/biome.json": {
        metadata: {
          updatedAt: "2025-05-26T13:05:11.401Z",
          updatedHash: "172291dd0b"
        },
        content: {
          "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
          vcs: {
            enabled: false,
            clientKind: "git",
            useIgnoreFile: false
          },
          files: {
            ignoreUnknown: false,
            ignore: [
              ".next",
              "dist",
              ".turbo",
              "dev-dist",
              ".zed",
              ".vscode",
              "routeTree.gen.ts",
              "src-tauri",
              ".nuxt"
            ]
          },
          formatter: {
            enabled: true,
            indentStyle: "tab"
          },
          organizeImports: {
            enabled: true
          },
          linter: {
            enabled: true,
            rules: {
              recommended: true,
              correctness: {
                useExhaustiveDependencies: "info"
              },
              nursery: {
                useSortedClasses: {
                  level: "warn",
                  fix: "safe",
                  options: {
                    functions: [
                      "clsx",
                      "cva",
                      "cn"
                    ]
                  }
                }
              }
            }
          },
          javascript: {
            formatter: {
              quoteStyle: "double"
            }
          }},
        type: "json",
      },
      "addons/husky/.husky/pre-commit": {
        metadata: {
          updatedAt: "2025-05-04T11:48:14.074Z",
          updatedHash: "07ede6f4a9"
        },
        content: `lint-staged\n`,
        type: "text",
      },
      "addons/pwa/apps/web/public/logo.png": {
        metadata: {
          updatedAt: "2025-05-04T11:48:14.127Z",
          updatedHash: "70aadde45a"
        },
        content: "",
        type: "binary",
        binaryHash: "70aadde45a",
      },
      "addons/pwa/apps/web/pwa-assets.config.ts": {
        metadata: {
          updatedAt: "2025-05-04T11:48:14.104Z",
          updatedHash: "422e1dc3ac"
        },
        content: `import {\n  defineConfig,\n  minimal2023Preset as preset,\n} from "@vite-pwa/assets-generator/config";\n\nexport default defineConfig({\n  headLinkOptions: {\n    preset: "2023",\n  },\n  preset,\n  images: ["public/logo.png"],\n});\n`,
        type: "text",
      },
      "addons/turborepo/turbo.json.hbs": {
        metadata: {
          updatedAt: "2025-05-04T11:48:14.155Z",
          updatedHash: "7530aefa69"
        },
        content: `{\n	"$schema": "https://turbo.build/schema.json",\n	"ui": "tui",\n	"tasks": {\n		"build": {\n			"dependsOn": ["^build"],\n			"inputs": ["$TURBO_DEFAULT$", ".env*"],\n			"outputs": ["dist/**"]\n		},\n		"lint": {\n			"dependsOn": ["^lint"]\n		},\n		"check": {\n			"dependsOn": ["^check-types"]\n		},\n		"dev": {\n			"cache": false,\n			"persistent": true\n		}{{#if (eq backend "convex")}},\n		"setup": {\n			"cache": false,\n			"persistent": true\n		}\n		{{else}}{{#unless (or (eq database "none") (eq orm "none"))}},\n		"db:push": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:studio": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:migrate": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:generate": {\n			"cache": false,\n			"persistent": true\n		}\n		{{/unless}}{{/if}}\n	}\n}\n`,
        type: "text",
      }
    },
  },
};
