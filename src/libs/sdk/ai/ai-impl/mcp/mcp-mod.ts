import { relinka } from "@reliverse/prompts";
import dotenv from "dotenv";
import { ofetch } from "ofetch";
dotenv.config();

/**
 * Handles "reliverse mcp" commands, supporting actions like listing servers,
 * retrieving server details, attributes, or instances.
 */
export async function handleMcpCommand(args: string[]): Promise<void> {
  const subcommand = args[0]?.toLowerCase();

  switch (subcommand) {
    case "servers":
      await listServers(args.slice(1));
      break;
    case "server":
      await showServer(args.slice(1));
      break;
    case "attributes":
      await listAttributes();
      break;
    case "instances":
      await listInstances(args.slice(1));
      break;
    default:
      printMcpUsage();
      break;
  }
}

/**
 * Lists MCP servers with optional flags for pagination and free-text queries.
 *   Usage: reliverse mcp servers --query "..." --first 10 --after <cursor>
 */
async function listServers(flags: string[]): Promise<void> {
  const params = parseFlags(flags);
  const queryParams: Record<string, string> = {};

  if (params.query) {
    queryParams.query = params.query;
  }
  if (params.first) {
    queryParams.first = params.first;
  }
  if (params.after) {
    queryParams.after = params.after;
  }

  const baseUrl = "https://glama.ai/api/mcp/v1/servers";
  // @ts-expect-error TODO: fix ts
  const queryString = new URLSearchParams(queryParams).toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  try {
    const data = await ofetch(url, { method: "GET" });
    relinka("info", JSON.stringify(data, null, 2));
  } catch (error) {
    relinka("error", "Failed to list MCP servers:", String(error));
  }
}

/**
 * Shows details about a specific server by ID.
 *   Usage: reliverse mcp server <id>
 */
async function showServer(flags: string[]): Promise<void> {
  const id = flags[0];
  if (!id) {
    relinka("error", "Missing server ID.");
    return;
  }

  const baseUrl = "https://glama.ai/api/mcp/v1/servers";
  const url = `${baseUrl}/${id}`;

  try {
    const data = await ofetch(url, { method: "GET" });
    relinka("info", JSON.stringify(data, null, 2));
  } catch (error) {
    relinka("error", `Failed to retrieve server ${id}:`, String(error));
  }
}

/**
 * Lists available MCP server attributes.
 *   Usage: reliverse mcp attributes
 */
async function listAttributes(): Promise<void> {
  const url = "https://glama.ai/api/mcp/v1/attributes";

  try {
    const data = await ofetch(url, { method: "GET" });
    relinka("info", JSON.stringify(data, null, 2));
  } catch (error) {
    relinka("error", "Failed to list MCP attributes:", String(error));
  }
}

/**
 * Lists MCP server instances, requiring a Bearer token in flags or via environment variable.
 *   Usage: reliverse mcp instances --token "YOUR_TOKEN_HERE"
 *   or set MCP_BEARER_TOKEN in your .env / environment.
 */
async function listInstances(flags: string[]): Promise<void> {
  const params = parseFlags(flags);
  // If no --token provided, use process.env.MCP_BEARER_TOKEN
  const token = params.token || process.env.MCP_BEARER_TOKEN;
  if (!token) {
    relinka(
      "error",
      "Missing Bearer token. Use --token <YOUR_TOKEN> or set MCP_BEARER_TOKEN in env.",
    );
    return;
  }

  const url = "https://glama.ai/api/mcp/v1/instances";

  try {
    const data = await ofetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    relinka("info", JSON.stringify(data, null, 2));
  } catch (error) {
    relinka("error", "Failed to list MCP instances:", String(error));
  }
}

/**
 * Parses a list of CLI flags (e.g. --query "foo" --first 10) into key-value pairs.
 */
function parseFlags(flags: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i]!;
    if (flag.startsWith("--")) {
      const key = flag.replace(/^--/, "");
      const next = flags[i + 1];
      if (next && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

/**
 * Prints usage instructions for "reliverse mcp" commands.
 */
function printMcpUsage(): void {
  relinka(
    "info",
    `Usage:
  reliverse mcp servers [--query <text>] [--first <n>] [--after <cursor>]
  reliverse mcp server <id>
  reliverse mcp attributes
  reliverse mcp instances [--token <YOUR_TOKEN_HERE>]

Examples:
  reliverse mcp servers --query "hacker news" --first 5
  reliverse mcp server oge85xl22f
  reliverse mcp attributes
  reliverse mcp instances --token MY_SECRET_TOKEN
  # or place MCP_BEARER_TOKEN=<TOKEN> in .env or the environment
`,
  );
}
