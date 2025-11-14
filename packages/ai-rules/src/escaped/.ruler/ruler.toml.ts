export const content = `# Ruler Configuration File
# See https://okigu.com/ruler for documentation.

# Default agents to run when --agents is not specified
default_agents = ["claude", "codex", "cursor", "warp", "zed", "crush", "opencode", "windsurf"]

# --- Global MCP Server Configuration ---
[mcp]
# Enable/disable MCP propagation globally (default: true)
enabled = true
# Global merge strategy: 'merge' or 'overwrite' (default: 'merge')
merge_strategy = "merge"

# --- MCP Server Definitions ---
[mcp_servers.context7]
command = "bunx"
args = ["-y", "@upstash/context7-mcp"]



[mcp_servers.shadcn]
command = "bunx"
args = ["shadcn@latest", "mcp"]



[mcp_servers.neon]
command = "bunx"
args = ["-y", "mcp-remote@latest", "https://mcp.neon.tech/mcp"]


[mcp_servers.better-auth]
url = "https://mcp.chonkie.ai/better-auth/better-auth-builder/mcp"


[mcp_servers.next-devtools]
command = "bunx"
args = ["-y", "next-devtools-mcp@latest"]

# --- Global .gitignore Configuration ---
[gitignore]
# Enable/disable automatic .gitignore updates (default: true)
enabled = true`;
