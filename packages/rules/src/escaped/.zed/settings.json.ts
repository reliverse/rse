export const content = `{
  "formatter": "language_server",
  "format_on_save": "on",
  "languages": {
    "JavaScript": {
      "formatter": {
        "language_server": {
          "name": "biome"
        }
      },
      "code_actions_on_format": {
        "source.fixAll.biome": true,
        "source.organizeImports.biome": true
      }
    },
    "TypeScript": {
      "formatter": {
        "language_server": {
          "name": "biome"
        }
      },
      "code_actions_on_format": {
        "source.fixAll.biome": true,
        "source.organizeImports.biome": true
      }
    },
    "JSX": {
      "formatter": {
        "language_server": {
          "name": "biome"
        }
      },
      "code_actions_on_format": {
        "source.fixAll.biome": true,
        "source.organizeImports.biome": true
      }
    },
    "TSX": {
      "formatter": {
        "language_server": {
          "name": "biome"
        }
      },
      "code_actions_on_format": {
        "source.fixAll.biome": true,
        "source.organizeImports.biome": true
      }
    }
  },
  "lsp": {
    "typescript-language-server": {
      "settings": {
        "typescript": {
          "preferences": {
            "includePackageJsonAutoImports": "on"
          }
        }
      }
    }
  },
  "context_servers": {
    "context7": {
      "command": "bunx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ],
      "source": "custom"
    },
    "shadcn": {
      "command": "bunx",
      "args": [
        "shadcn@latest",
        "mcp"
      ],
      "source": "custom"
    },
    "neon": {
      "command": "bunx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://mcp.neon.tech/mcp"
      ],
      "source": "custom"
    },
    "better-auth": {
      "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp",
      "source": "custom"
    },
    "next-devtools": {
      "command": "bunx",
      "args": [
        "-y",
        "next-devtools-mcp@latest"
      ],
      "source": "custom"
    }
  }
}`;
