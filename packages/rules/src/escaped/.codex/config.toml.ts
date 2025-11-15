export const content = `[mcp_servers.context7]
command = "bunx"
args = [ "-y", "@upstash/context7-mcp" ]

[mcp_servers.shadcn]
command = "bunx"
args = [ "shadcn@latest", "mcp" ]

[mcp_servers.neon]
command = "bunx"
args = [ "-y", "mcp-remote@latest", "https://mcp.neon.tech/mcp" ]

[mcp_servers.better-auth]
command = "bunx"
args = [
  "-y",
  "mcp-remote@latest",
  "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"
]

[mcp_servers.next-devtools]
command = "bunx"
args = [ "-y", "next-devtools-mcp@latest" ]
`;
