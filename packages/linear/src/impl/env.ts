import { LinearClient } from "@linear/sdk";
import type { LinearTodoStatus } from "./status";

export interface LinearEnvConfig {
  apiKey?: string;
  todoTeamId?: string;
  todoProjectId?: string;
  todoLabel?: string;
  todoStatus?: string;
  todoAssigneeId?: string;
  todoPriority?: number;
}

function readEnv(name: string): string | undefined {
  // Bun and Node compatibility
  // eslint-disable-next-line no-restricted-globals
  const bunEnv = (globalThis as any).Bun?.env as
    | Record<string, string | undefined>
    | undefined;
  if (bunEnv && typeof bunEnv[name] === "string") {
    return bunEnv[name];
  }
  if (
    typeof process !== "undefined" &&
    process.env &&
    typeof process.env[name] === "string"
  ) {
    return process.env[name];
  }
  return undefined;
}

export function getLinearEnvConfig(): LinearEnvConfig {
  const priorityEnv = readEnv("LINEAR_DEFAULT_PRIORITY");
  let todoPriority: number | undefined;
  if (priorityEnv) {
    const priority = Number.parseInt(priorityEnv, 10);
    if (!Number.isFinite(priority)) {
      throw new Error(
        `Invalid LINEAR_DEFAULT_PRIORITY value "${priorityEnv}". Must be a number between 0 and 4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low).`,
      );
    }
    todoPriority = priority;
  }

  return {
    apiKey: readEnv("LINEAR_API_KEY"),
    todoTeamId: readEnv("LINEAR_DEFAULT_TEAM_ID"),
    todoProjectId: readEnv("LINEAR_DEFAULT_PROJECT_ID"),
    todoLabel: readEnv("LINEAR_DEFAULT_LABEL"),
    todoStatus: readEnv("LINEAR_DEFAULT_STATUS"),
    todoAssigneeId: readEnv("LINEAR_DEFAULT_ASSIGNEE_ID"),
    todoPriority,
  };
}

export function createLinearClient(explicitApiKey?: string): LinearClient {
  const env = getLinearEnvConfig();
  const apiKey = explicitApiKey || env.apiKey;

  if (!apiKey) {
    throw new Error(
      "Missing Linear API key. Set LINEAR_API_KEY in the environment or pass an explicit apiKey.",
    );
  }

  return new LinearClient({ apiKey });
}

export type { LinearTodoStatus };
