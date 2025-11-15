export const content = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "local",
      "enabled": true,
      "command": ["bunx", "-y", "@upstash/context7-mcp"]
    },
    "shadcn": {
      "type": "local",
      "enabled": true,
      "command": ["bunx", "shadcn@latest", "mcp"]
    },
    "neon": {
      "type": "local",
      "enabled": true,
      "command": ["bunx", "-y", "mcp-remote@latest", "https://mcp.neon.tech/mcp"]
    },
    "better-auth": {
      "type": "remote",
      "enabled": true,
      "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"
    },
    "next-devtools": {
      "type": "local",
      "enabled": true,
      "command": ["bunx", "-y", "next-devtools-mcp@latest"]
    }
  }
}
`;
