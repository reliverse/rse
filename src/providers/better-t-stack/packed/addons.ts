import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_ADDONS: Template = {
  name: "addons",
  description: "Template generated from 12 files",
  updatedAt: "2025-06-17T20:33:59.528Z",
  config: {
    files: {
      "addons/biome/biome.json": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0401c82b8b",
        },
        content: {
          $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
          vcs: {
            enabled: false,
            clientKind: "git",
            useIgnoreFile: false,
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
              ".nuxt",
            ],
          },
          formatter: {
            enabled: true,
            indentStyle: "tab",
          },
          organizeImports: {
            enabled: true,
          },
          linter: {
            enabled: true,
            rules: {
              recommended: true,
              correctness: {
                useExhaustiveDependencies: "info",
              },
              nursery: {
                useSortedClasses: {
                  level: "warn",
                  fix: "safe",
                  options: {
                    functions: ["clsx", "cva", "cn"],
                  },
                },
              },
            },
          },
          javascript: {
            formatter: {
              quoteStyle: "double",
            },
          },
        },
        type: "json",
      },
      "addons/husky/.husky/pre-commit": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "07ede6f4a9",
        },
        content: `lint-staged\n`,
        type: "text",
      },
      "addons/pwa/apps/web/next/public/favicon/apple-touch-icon.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b72f6b7339",
        },
        content: "",
        type: "binary",
        binaryHash: "b72f6b7339",
      },
      "addons/pwa/apps/web/next/public/favicon/favicon-96x96.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "01dad80fc2",
        },
        content: "",
        type: "binary",
        binaryHash: "01dad80fc2",
      },
      "addons/pwa/apps/web/next/public/favicon/favicon.svg": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "eda53e30fe",
        },
        content: "",
        type: "binary",
        binaryHash: "eda53e30fe",
      },
      "addons/pwa/apps/web/next/public/favicon/site.webmanifest.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "569a179bb9",
        },
        content: `{\n	"name": "{{projectName}}",\n	"short_name": "{{projectName}}",\n	"icons": [\n		{\n			"src": "/web-app-manifest-192x192.png",\n			"sizes": "192x192",\n			"type": "image/png",\n			"purpose": "maskable"\n		},\n		{\n			"src": "/web-app-manifest-512x512.png",\n			"sizes": "512x512",\n			"type": "image/png",\n			"purpose": "maskable"\n		}\n	],\n	"theme_color": "#ffffff",\n	"background_color": "#ffffff",\n	"display": "standalone"\n}\n`,
        type: "text",
      },
      "addons/pwa/apps/web/next/public/favicon/web-app-manifest-192x192.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2dc8b34485",
        },
        content: "",
        type: "binary",
        binaryHash: "2dc8b34485",
      },
      "addons/pwa/apps/web/next/public/favicon/web-app-manifest-512x512.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "dee83fc2fb",
        },
        content: "",
        type: "binary",
        binaryHash: "dee83fc2fb",
      },
      "addons/pwa/apps/web/next/src/app/manifest.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "6f8734ebe6",
        },
        content: `import type { MetadataRoute } from "next";\n\nexport default function manifest(): MetadataRoute.Manifest {\n	return {\n		name: "{{projectName}}",\n		short_name: "{{projectName}}",\n		description:\n			"my pwa app",\n		start_url: "/new",\n		display: "standalone",\n		background_color: "#ffffff",\n		theme_color: "#000000",\n		icons: [\n			{\n				src: "/favicon/web-app-manifest-192x192.png",\n				sizes: "192x192",\n				type: "image/png",\n			},\n			{\n				src: "/favicon/web-app-manifest-512x512.png",\n				sizes: "512x512",\n				type: "image/png",\n			},\n		],\n	};\n}\n`,
        type: "text",
      },
      "addons/pwa/apps/web/vite/public/logo.png": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "70aadde45a",
        },
        content: "",
        type: "binary",
        binaryHash: "70aadde45a",
      },
      "addons/pwa/apps/web/vite/pwa-assets.config.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "422e1dc3ac",
        },
        content: `import {\n  defineConfig,\n  minimal2023Preset as preset,\n} from "@vite-pwa/assets-generator/config";\n\nexport default defineConfig({\n  headLinkOptions: {\n    preset: "2023",\n  },\n  preset,\n  images: ["public/logo.png"],\n});\n`,
        type: "text",
      },
      "addons/turborepo/turbo.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "62f4fbd66c",
        },
        content: `{\n	"$schema": "https://turbo.build/schema.json",\n	"ui": "tui",\n	"tasks": {\n		"build": {\n			"dependsOn": ["^build"],\n			"inputs": ["$TURBO_DEFAULT$", ".env*"],\n			"outputs": ["dist/**"]\n		},\n		"lint": {\n			"dependsOn": ["^lint"]\n		},\n		"check-types": {\n			"dependsOn": ["^check-types"]\n		},\n		"dev": {\n			"cache": false,\n			"persistent": true\n		}{{#if (eq backend "convex")}},\n		"setup": {\n			"cache": false,\n			"persistent": true\n		}\n		{{else}}{{#unless (or (eq database "none") (eq orm "none"))}},\n		"db:push": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:studio": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:migrate": {\n			"cache": false,\n			"persistent": true\n		},\n		"db:generate": {\n			"cache": false,\n			"persistent": true\n		}\n		{{/unless}}{{/if}}\n	}\n}\n`,
        type: "text",
      },
    },
  },
};
