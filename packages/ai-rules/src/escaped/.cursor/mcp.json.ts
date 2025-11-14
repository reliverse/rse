export const content = `{
  "mcpServers": {
    "context7": {
      "command": "bunx",
      "args": ["-y", "@upstash/context7-mcp"],
      "type": "stdio"
    },
    "shadcn": {
      "command": "bunx",
      "args": ["shadcn@latest", "mcp"],
      "type": "stdio"
    },
    "neon": {
      "command": "bunx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.neon.tech/mcp"],
      "type": "stdio"
    },
    "better-auth": {
      "url": "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp",
      "type": "remote"
    },
    "next-devtools": {
      "command": "bunx",
      "args": ["-y", "next-devtools-mcp@latest"],
      "type": "stdio"
    }
  }
}
`;
