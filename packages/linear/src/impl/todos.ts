import type { Issue, LinearClient, LinearFetch } from "@linear/sdk";
import {
  createLinearClient,
  getLinearEnvConfig,
  type LinearEnvConfig,
  type LinearTodoStatus,
} from "./env";
import { validateLabels } from "./labels";
import { normalizeStatus } from "./status";

function logTodoDebug(message: string, payload?: Record<string, unknown>) {
  const debugMode = process.env.LINEAR_DEBUG_MODE?.toLowerCase();
  const isEnabled = debugMode === "1" || debugMode === "true";
  if (!isEnabled) return;
  // eslint-disable-next-line no-console
  console.info(`[linear][todo] ${message}`, payload ?? {});
}

function logTodoError(
  message: string,
  error: unknown,
  payload?: Record<string, unknown>,
) {
  // eslint-disable-next-line no-console
  console.error(`[linear][todo] ${message}`, {
    error,
    ...(payload ?? {}),
  });
}

/**
 * Process escape sequences in strings (e.g., "\\n" -> newline, "\\t" -> tab).
 * This allows users to pass escape sequences as literal strings that get converted to actual characters.
 * Linear supports newlines and tabs in descriptions, so this makes the CLI more user-friendly.
 *
 * This function converts literal escape sequences (like "\n" and "\t") into actual newline and tab characters
 * that Linear can properly render in the issue description.
 */
function processEscapeSequences(text: string): string {
  if (!text || typeof text !== "string") return text;

  // Process common escape sequences in order of specificity
  // Start with the most specific patterns to avoid conflicts
  let processed = text;

  // Handle escaped backslashes first (but preserve them for later processing)
  // We'll handle this at the end to avoid double-processing

  // Process escape sequences (order matters - do specific ones first)
  processed = processed.replace(/\\n/g, "\n"); // newline
  processed = processed.replace(/\\r/g, "\r"); // carriage return
  processed = processed.replace(/\\t/g, "\t"); // tab
  processed = processed.replace(/\\b/g, "\b"); // backspace
  processed = processed.replace(/\\f/g, "\f"); // form feed
  processed = processed.replace(/\\v/g, "\v"); // vertical tab
  processed = processed.replace(/\\a/g, "\x07"); // bell/alert
  processed = processed.replace(/\\e/g, "\x1B"); // escape

  // Handle escaped backslashes last (convert \\ to \)
  // This must be last to avoid double-processing escape sequences
  processed = processed.replace(/\\\\/g, "\\");

  return processed;
}
export async function validateTodoTeamId(
  teamId: string,
  options?: {
    apiKey?: string;
    envOverride?: LinearEnvConfig;
  },
): Promise<void> {
  const startedAt = Date.now();
  logTodoDebug("validateTodoTeamId: start", { teamId });

  try {
    const client = createLinearClient(options?.apiKey);
    const teamsConn = await client.teams({ first: 100 });
    const teams = teamsConn.nodes ?? [];
    const match = teams.find((t) => t.id === teamId);

    if (!match) {
      const availableTeams = teams
        .map((t) => `  - ${t.id} (${t.name})`)
        .join("\n");
      const teamsList = availableTeams || "  (no teams found)";
      throw new Error(
        `No Linear team found for id "${teamId}".\n\nAvailable teams:\n${teamsList}\n\nSet LINEAR_DEFAULT_TEAM_ID correctly or pass a valid --teamId.`,
      );
    }

    logTodoDebug("validateTodoTeamId: success", {
      teamId,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    logTodoError("validateTodoTeamId: failed", error, { teamId });
    throw error;
  }
}

export async function validateStatus(
  status: string,
  options?: { apiKey?: string },
): Promise<LinearTodoStatus> {
  const startedAt = Date.now();
  logTodoDebug("validateStatus: start", { status });

  try {
    const lower = status.toLowerCase();
    // Check if input contains any valid status keywords (matching normalizeStatus logic)
    // Backlog: Icebox, Backlog
    // Unstarted: Todo
    // Started: In Progress, In Review, Ready to Merge
    // Completed: Done
    // Canceled: Canceled, Could not reproduce, Won't Fix, Duplicate
    const hasValidKeyword =
      lower.includes("icebox") ||
      lower.includes("backlog") ||
      lower.includes("unstarted") ||
      lower.includes("planned") ||
      lower.includes("todo") ||
      lower.includes("to do") ||
      lower.includes("ready to merge") ||
      lower.includes("ready_to_merge") ||
      lower.includes("in review") ||
      lower.includes("in_review") ||
      lower.includes("in progress") ||
      lower.includes("in_progress") ||
      lower.includes("started") ||
      lower.includes("done") ||
      lower.includes("completed") ||
      lower.includes("cancel") ||
      lower.includes("canceled") ||
      lower.includes("cancelled") ||
      lower.includes("could not reproduce") ||
      lower.includes("could_not_reproduce") ||
      lower.includes("won't fix") ||
      lower.includes("wont fix") ||
      lower.includes("wont_fix") ||
      lower.includes("duplicate");

    if (!hasValidKeyword) {
      const validStatuses: LinearTodoStatus[] = [
        "backlog",
        "todo",
        "in_progress",
        "done",
        "canceled",
      ];
      throw new Error(
        `Invalid status "${status}". Valid statuses are: ${validStatuses.join(", ")}.`,
      );
    }

    const normalizedStatus = normalizeStatus(status);
    const client = createLinearClient(options?.apiKey);
    const workflowStatesConn = await client.workflowStates({ first: 100 });
    const workflowStates = workflowStatesConn.nodes ?? [];

    const match = workflowStates.find((state) => {
      const stateName = state.name.toLowerCase();
      const normalized = normalizeStatus(stateName);
      return normalized === normalizedStatus;
    });

    if (!match) {
      const availableStatuses = workflowStates
        .map((state) => {
          const normalized = normalizeStatus(state.name.toLowerCase());
          return `  - ${normalized} (${state.name})`;
        })
        .filter(
          (v, i, arr) =>
            arr.findIndex((x) => x.split(" ")[2] === v.split(" ")[2]) === i,
        )
        .join("\n");
      const statusesList = availableStatuses || "  (no statuses found)";
      throw new Error(
        `No Linear workflow state found matching status "${status}" (normalized: "${normalizedStatus}").\n\nAvailable statuses:\n${statusesList}\n\nSet LINEAR_DEFAULT_STATUS correctly or pass a valid status.`,
      );
    }

    logTodoDebug("validateStatus: success", {
      status,
      normalizedStatus,
      durationMs: Date.now() - startedAt,
    });

    return normalizedStatus;
  } catch (error) {
    logTodoError("validateStatus: failed", error, { status });
    throw error;
  }
}

export async function validateAssignee(
  assigneeId: string,
  teamId: string,
  options?: { apiKey?: string },
): Promise<void> {
  const startedAt = Date.now();
  logTodoDebug("validateAssignee: start", { assigneeId, teamId });

  try {
    const client = createLinearClient(options?.apiKey);
    const team = await client.team(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const membersConn = await team.members({ first: 100 });
    const members = membersConn.nodes ?? [];
    const match = members.find((m) => m.id === assigneeId);

    if (!match) {
      const availableAssignees = members
        .map((m) => {
          const userId = m.id;
          const name = m.name ?? "Unknown";
          return `  - ${userId} (${name})`;
        })
        .join("\n");
      const assigneesList = availableAssignees || "  (no team members found)";
      throw new Error(
        `No Linear team member found for assignee id "${assigneeId}" in team "${teamId}".\n\nAvailable team members:\n${assigneesList}\n\nSet LINEAR_DEFAULT_ASSIGNEE_ID correctly or pass a valid assigneeId.`,
      );
    }

    logTodoDebug("validateAssignee: success", {
      assigneeId,
      teamId,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    logTodoError("validateAssignee: failed", error, { assigneeId, teamId });
    throw error;
  }
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateTodoTeamIdSafe(
  teamId: string,
  options?: { apiKey?: string },
): Promise<ValidationResult> {
  try {
    await validateTodoTeamId(teamId, options);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}

export async function validateStatusSafe(
  status: string,
  options?: { apiKey?: string },
): Promise<ValidationResult & { normalizedStatus?: LinearTodoStatus }> {
  try {
    const normalizedStatus = await validateStatus(status, options);
    return { valid: true, normalizedStatus };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}

export async function validateAssigneeSafe(
  assigneeId: string,
  teamId: string,
  options?: { apiKey?: string },
): Promise<ValidationResult> {
  try {
    await validateAssignee(assigneeId, teamId, options);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}

export async function validateProjectIdSafe(
  projectId: string,
  options?: { apiKey?: string },
): Promise<ValidationResult> {
  try {
    const projects = await listTodoProjectsImpl(options);
    const found = projects.some((p) => p.id === projectId);
    if (!found) {
      const availableProjects = projects
        .map((p) => `  - ${p.id} (${p.name})`)
        .join("\n");
      const projectsList = availableProjects || "  (no projects found)";
      return {
        valid: false,
        error: `No Linear project found for id "${projectId}".\n\nAvailable projects:\n${projectsList}\n\nRun "bun cli todo --action projects" to list valid project ids.`,
      };
    }
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}

export async function validateLabelSafe(
  labelName: string,
  options?: { apiKey?: string },
): Promise<ValidationResult> {
  try {
    const client = createLinearClient(options?.apiKey);
    await validateLabels(client as unknown as LinearClient, [labelName]);
    return { valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: message };
  }
}

export interface EnvValidationResult {
  todoTeamId?: ValidationResult;
  todoProjectId?: ValidationResult;
  todoLabel?: ValidationResult;
  todoStatus?: ValidationResult;
  todoAssigneeId?: ValidationResult;
  todoPriority?: ValidationResult;
}

export async function validateLinearEnvConfig(
  env: LinearEnvConfig,
  options?: { apiKey?: string },
): Promise<EnvValidationResult> {
  const result: EnvValidationResult = {};

  if (env.todoTeamId && env.todoTeamId.length > 0) {
    result.todoTeamId = await validateTodoTeamIdSafe(env.todoTeamId, options);
  }

  if (env.todoProjectId && env.todoProjectId.length > 0) {
    result.todoProjectId = await validateProjectIdSafe(
      env.todoProjectId,
      options,
    );
  }

  if (env.todoLabel && env.todoLabel.length > 0) {
    result.todoLabel = await validateLabelSafe(env.todoLabel, options);
  }

  if (env.todoStatus && env.todoStatus.length > 0) {
    result.todoStatus = await validateStatusSafe(env.todoStatus, options);
  }

  if (
    env.todoAssigneeId &&
    env.todoAssigneeId.length > 0 &&
    env.todoTeamId &&
    env.todoTeamId.length > 0
  ) {
    result.todoAssigneeId = await validateAssigneeSafe(
      env.todoAssigneeId,
      env.todoTeamId,
      options,
    );
  }

  if (typeof env.todoPriority === "number") {
    if (env.todoPriority < 0 || env.todoPriority > 4) {
      result.todoPriority = {
        valid: false,
        error:
          "LINEAR_DEFAULT_PRIORITY must be between 0 and 4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low).",
      };
    } else {
      result.todoPriority = { valid: true };
    }
  }

  return result;
}

export interface LinearTodoInput {
  title: string;
  description?: string;
  context?: string;
  teamId?: string;
  projectId?: string;
  labels?: string[];
  priority?: number;
  status?: LinearTodoStatus;
  assigneeId?: string;
}

export interface LinearTodoUpdateInput {
  id: string;
  title?: string;
  description?: string;
  context?: string;
  status?: LinearTodoStatus;
  priority?: number;
  assigneeId?: string;
}

export interface LinearTodo {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  status: LinearTodoStatus;
  url?: string;
  priority?: number;
  teamId?: string;
  projectId?: string;
  labels?: string[];
  assigneeId?: string;
}

export interface LinearTodoProject {
  id: string;
  name: string;
}

export interface LinearTodoTeam {
  id: string;
  name: string;
}

type MaybeLinearIssue = Issue | LinearFetch<Issue> | null | undefined;

async function resolveIssue(
  maybeIssue: MaybeLinearIssue,
  notFoundMessage?: string,
): Promise<Issue> {
  if (!maybeIssue) {
    throw new Error(notFoundMessage ?? "Linear issue not found.");
  }

  if ("id" in maybeIssue && typeof maybeIssue.id === "string") {
    return maybeIssue;
  }

  const resolved = await maybeIssue;

  if (!resolved) {
    throw new Error(notFoundMessage ?? "Linear issue not found.");
  }

  return resolved;
}

export async function createTodoImpl(
  input: LinearTodoInput,
  options?: { apiKey?: string },
): Promise<LinearTodo> {
  const startedAt = Date.now();
  logTodoDebug("createTodoImpl: start", {
    hasDescription: Boolean(input.description),
    hasContext: Boolean(input.context),
    teamId: input.teamId,
    projectId: input.projectId,
    hasLabels: Array.isArray(input.labels) && input.labels.length > 0,
    priority: input.priority,
  });

  try {
    const client = createLinearClient(options?.apiKey);
    const env = getLinearEnvConfig();

    const teamId = input.teamId || env.todoTeamId;
    if (!teamId) {
      throw new Error(
        "Missing Linear team id. Set LINEAR_DEFAULT_TEAM_ID in env or pass teamId to createTodo.",
      );
    }

    const labelNames =
      input.labels || (env.todoLabel ? [env.todoLabel] : undefined);
    const labelIds =
      labelNames && labelNames.length > 0
        ? await validateLabels(client as unknown as LinearClient, labelNames)
        : undefined;

    const statusInput =
      input.status ||
      (env.todoStatus ? normalizeStatus(env.todoStatus) : undefined);
    if (statusInput) {
      // Validate requested/default status even though we let Linear pick the state
      await validateStatus(statusInput, options);
    }
    let stateId: string | undefined;
    // Skip setting stateId - let Linear use the team's default state
    // Workflow states are team-specific and we can't easily filter them by team via the SDK
    // Linear will assign the appropriate default state for the team

    const assigneeId = input.assigneeId || env.todoAssigneeId;
    if (assigneeId) {
      await validateAssignee(assigneeId, teamId, options);
    }

    const priority = input.priority ?? env.todoPriority;
    if (typeof priority === "number" && (priority < 0 || priority > 4)) {
      throw new Error(
        "Priority must be between 0 and 4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low).",
      );
    }

    const descriptionParts: string[] = [];
    // Ensure description is a string before processing (reject booleans, numbers, etc.)
    if (input.description !== undefined && input.description !== null) {
      logTodoDebug("createTodoImpl: processing description", {
        descriptionType: typeof input.description,
        descriptionValue: JSON.stringify(input.description),
        descriptionLength:
          typeof input.description === "string"
            ? input.description.length
            : undefined,
        hasEscapeSequences:
          typeof input.description === "string"
            ? /\\[nrtbfvae]/.test(input.description)
            : false,
      });
      if (typeof input.description !== "string") {
        const error = new Error(
          `Description must be a string, but got ${typeof input.description}: ${JSON.stringify(input.description)}. This indicates an argument parsing issue.`,
        );
        logTodoError("createTodoImpl: description is not a string", error, {
          title: input.title,
        });
        throw error;
      } else if (input.description) {
        // Trim leading "-" if present (handles cases where argument parser interprets it as a flag)
        let descriptionToProcess = input.description;
        if (
          descriptionToProcess.startsWith("-") &&
          descriptionToProcess.length > 1
        ) {
          descriptionToProcess = descriptionToProcess.substring(1).trimStart();
          logTodoDebug("createTodoImpl: trimmed leading '-' from description", {
            originalLength: input.description.length,
            trimmedLength: descriptionToProcess.length,
          });
        }
        // Convert escape sequences (\n, \t, etc.) to actual characters
        // This creates a proper multiline string that Linear can render
        const processedDescription =
          processEscapeSequences(descriptionToProcess);
        logTodoDebug("createTodoImpl: processed description", {
          originalLength: input.description.length,
          trimmedLength: descriptionToProcess.length,
          processedLength: processedDescription.length,
          originalPreview: input.description.substring(0, 100),
          trimmedPreview: descriptionToProcess.substring(0, 100),
          processedPreview: processedDescription.substring(0, 100),
          hasNewlines: processedDescription.includes("\n"),
          hasTabs: processedDescription.includes("\t"),
        });
        // Only add if the processed description is not empty
        if (processedDescription && processedDescription.trim().length > 0) {
          descriptionParts.push(processedDescription);
        }
      }
    }
    // Ensure context is a string before processing (reject booleans, numbers, etc.)
    if (input.context !== undefined && input.context !== null) {
      if (typeof input.context !== "string") {
        const error = new Error(
          `Context must be a string, but got ${typeof input.context}: ${JSON.stringify(input.context)}. This indicates an argument parsing issue.`,
        );
        logTodoError("createTodoImpl: context is not a string", error, {
          title: input.title,
        });
        throw error;
      } else if (input.context) {
        // Convert escape sequences in context as well
        const processedContext = processEscapeSequences(input.context);
        if (processedContext && processedContext.trim().length > 0) {
          descriptionParts.push(`\n\nContext: ${processedContext}`);
        }
      }
    }

    // Build the final multiline description string
    // This ensures we're sending actual newlines and tabs, not escape sequences
    let finalDescription: string | undefined =
      descriptionParts.length > 0 ? descriptionParts.join("") : undefined;

    // Final validation: ensure we never send invalid values like "true", "false", or non-strings
    if (finalDescription !== undefined) {
      if (typeof finalDescription !== "string") {
        const error = new Error(
          `Final description must be a string, but got ${typeof finalDescription}: ${JSON.stringify(finalDescription)}. This indicates a processing error.`,
        );
        logTodoError(
          "createTodoImpl: finalDescription is not a string",
          error,
          {
            title: input.title,
          },
        );
        throw error;
      } else if (finalDescription === "true" || finalDescription === "false") {
        const error = new Error(
          `Description was parsed as boolean string "${finalDescription}" instead of the actual description text. This indicates an argument parsing issue. The description value may have been lost during parsing. Try using proper quoting in PowerShell: --description "your description here" or --description='your description here'`,
        );
        logTodoError(
          "createTodoImpl: finalDescription is a boolean string",
          error,
          {
            title: input.title,
          },
        );
        throw error;
      } else if (finalDescription.trim().length === 0) {
        // Don't send empty descriptions, but this is not an error - just skip it
        logTodoDebug(
          "createTodoImpl: finalDescription is empty after trimming",
          {
            title: input.title,
          },
        );
        finalDescription = undefined;
      }
    }

    logTodoDebug("createTodoImpl: final description", {
      hasDescription: finalDescription !== undefined,
      descriptionType: typeof finalDescription,
      descriptionLength: finalDescription?.length ?? 0,
      lineCount: finalDescription?.split("\n").length ?? 0,
      descriptionPreview: finalDescription
        ? finalDescription
            .substring(0, 200)
            .replace(/\n/g, "\\n")
            .replace(/\t/g, "\\t")
        : "N/A",
      // Show first few lines for debugging
      firstLines:
        finalDescription
          ?.split("\n")
          .slice(0, 3)
          .map((line, i) => `Line ${i + 1}: ${line.substring(0, 50)}`) ?? [],
    });

    // Build the issue payload - only include description if it's a valid non-empty string
    const issuePayload: {
      teamId: string;
      title: string;
      description?: string;
      projectId?: string;
      priority?: number;
      labelIds?: string[];
      stateId?: string;
      assigneeId?: string;
    } = {
      teamId,
      title: input.title,
    };

    // Only add description if it's a valid string (not "true", "false", or empty)
    if (
      finalDescription &&
      typeof finalDescription === "string" &&
      finalDescription.trim().length > 0
    ) {
      issuePayload.description = finalDescription;
    }

    // Add optional fields
    if (input.projectId || env.todoProjectId) {
      issuePayload.projectId = input.projectId || env.todoProjectId;
    }
    if (typeof priority === "number") {
      issuePayload.priority = priority;
    }
    if (labelIds && labelIds.length > 0) {
      issuePayload.labelIds = labelIds;
    }
    if (stateId) {
      issuePayload.stateId = stateId;
    }
    if (assigneeId) {
      issuePayload.assigneeId = assigneeId;
    }

    const payload = await client.createIssue(issuePayload);

    if (!payload.issue) {
      throw new Error("Failed to create Linear todo (issue payload missing).");
    }

    const issue = await resolveIssue(
      payload.issue,
      "Failed to create Linear todo (issue missing).",
    );
    const state = await issue.state;
    const statusName = state?.name?.toLowerCase() || "todo";

    const assignee = await issue.assignee;
    const result: LinearTodo = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      status: normalizeStatus(statusName),
      url: issue.url || undefined,
      priority: issue.priority ?? undefined,
      teamId,
      projectId: issue.projectId || undefined,
      labels: labelIds,
      assigneeId: assignee?.id || undefined,
    };

    logTodoDebug("createTodoImpl: success", {
      id: result.id,
      identifier: result.identifier,
      status: result.status,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    logTodoError("createTodoImpl: failed", error, {
      title: input.title,
      teamId: input.teamId,
      projectId: input.projectId,
    });
    throw error;
  }
}

export async function listTodosImpl(options?: {
  apiKey?: string;
  limit?: number;
  status?: LinearTodoStatus | LinearTodoStatus[];
  teamId?: string;
  projectId?: string;
}): Promise<LinearTodo[]> {
  const startedAt = Date.now();
  logTodoDebug("listTodosImpl: start", {
    limit: options?.limit,
    status: options?.status,
    teamId: options?.teamId,
    projectId: options?.projectId,
  });

  try {
    const client = createLinearClient(options?.apiKey);
    const env = getLinearEnvConfig();
    const requestedLimit =
      options?.limit && options.limit > 0 ? options.limit : 50;

    // Normalize status filter to array for consistent handling
    const statusFilter = options?.status
      ? Array.isArray(options.status)
        ? options.status
        : [options.status]
      : undefined;

    // When filtering by status, fetch more issues to ensure we get enough matching results
    // Linear returns issues in order, so if we only fetch 'limit' issues, we might miss matches
    // Fetch up to 5x the limit or 250 (whichever is smaller) when filtering by status
    const fetchLimit = statusFilter
      ? Math.min(requestedLimit * 5, 250)
      : requestedLimit;

    const issuesConn = await client.issues({ first: fetchLimit });
    const issues = issuesConn.nodes;

    const todos: LinearTodo[] = [];

    for (const issue of issues) {
      const state = await issue.state;
      const statusName = state?.name?.toLowerCase() || "todo";
      const status = normalizeStatus(statusName);

      if (statusFilter && !statusFilter.includes(status)) continue;

      const targetTeamId = options?.teamId || env.todoTeamId;
      if (targetTeamId && issue.teamId && issue.teamId !== targetTeamId)
        continue;

      if (
        options?.projectId &&
        issue.projectId &&
        issue.projectId !== options.projectId
      )
        continue;

      const assignee = await issue.assignee;
      todos.push({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description || undefined,
        status,
        url: issue.url || undefined,
        priority: issue.priority ?? undefined,
        teamId: issue.teamId || undefined,
        projectId: issue.projectId || undefined,
        labels: undefined,
        assigneeId: assignee?.id || undefined,
      });

      // Stop once we have enough matching results
      if (todos.length >= requestedLimit) break;
    }

    logTodoDebug("listTodosImpl: success", {
      requestedLimit: options?.limit,
      fetchLimit,
      returnedCount: todos.length,
      durationMs: Date.now() - startedAt,
    });

    return todos;
  } catch (error) {
    logTodoError("listTodosImpl: failed", error, {
      limit: options?.limit,
      status: options?.status,
      teamId: options?.teamId,
      projectId: options?.projectId,
    });
    throw error;
  }
}

export async function listTodoProjectsImpl(options?: {
  apiKey?: string;
}): Promise<LinearTodoProject[]> {
  const startedAt = Date.now();
  logTodoDebug("listTodoProjectsImpl: start");

  try {
    const client = createLinearClient(options?.apiKey);
    const env = getLinearEnvConfig();

    const conn = await client.projects({ first: 100 });
    const projects = conn.nodes ?? [];

    const todosProjects: LinearTodoProject[] = [];

    for (const project of projects) {
      if (!project.id || !project.name) continue;

      // If a specific todo team is configured, prefer projects belonging to it.
      // The Linear SDK exposes "team" lazily, so we avoid extra awaits and just
      // filter by name when an explicit project id is configured in env.
      if (env.todoProjectId && project.id === env.todoProjectId) {
        todosProjects.push({ id: project.id, name: project.name });
        continue;
      }

      todosProjects.push({ id: project.id, name: project.name });
    }

    logTodoDebug("listTodoProjectsImpl: success", {
      count: todosProjects.length,
      configuredProjectId: env.todoProjectId,
      durationMs: Date.now() - startedAt,
    });

    return todosProjects;
  } catch (error) {
    logTodoError("listTodoProjectsImpl: failed", error);
    throw error;
  }
}

export async function listTodoTeamsImpl(options?: {
  apiKey?: string;
}): Promise<LinearTodoTeam[]> {
  const startedAt = Date.now();
  logTodoDebug("listTodoTeamsImpl: start");

  try {
    const client = createLinearClient(options?.apiKey);
    const conn = await client.teams({ first: 100 });
    const teams = conn.nodes ?? [];

    const result: LinearTodoTeam[] = [];

    for (const team of teams) {
      if (!team.id || !team.name) continue;
      result.push({ id: team.id, name: team.name });
    }

    logTodoDebug("listTodoTeamsImpl: success", {
      count: result.length,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    logTodoError("listTodoTeamsImpl: failed", error);
    throw error;
  }
}

export async function getTodoImpl(
  id: string,
  options?: { apiKey?: string },
): Promise<LinearTodo | null> {
  const startedAt = Date.now();
  logTodoDebug("getTodoImpl: start", { id });

  try {
    const client = createLinearClient(options?.apiKey);
    const issue = await client.issue(id);
    if (!issue) {
      logTodoDebug("getTodoImpl: not found", {
        id,
        durationMs: Date.now() - startedAt,
      });
      return null;
    }

    const state = await issue.state;
    const statusName = state?.name?.toLowerCase() || "todo";
    const assignee = await issue.assignee;

    const result: LinearTodo = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      status: normalizeStatus(statusName),
      url: issue.url || undefined,
      priority: issue.priority ?? undefined,
      teamId: issue.teamId || undefined,
      projectId: issue.projectId || undefined,
      labels: undefined,
      assigneeId: assignee?.id || undefined,
    };

    logTodoDebug("getTodoImpl: success", {
      id: result.id,
      identifier: result.identifier,
      status: result.status,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    logTodoError("getTodoImpl: failed", error, { id });
    throw error;
  }
}

export async function updateTodoImpl(
  input: LinearTodoUpdateInput,
  options?: { apiKey?: string },
): Promise<LinearTodo> {
  const startedAt = Date.now();
  logTodoDebug("updateTodoImpl: start", {
    id: input.id,
    hasTitle: input.title !== undefined,
    hasDescription: input.description !== undefined,
    hasContext: input.context !== undefined,
    hasStatus: input.status !== undefined,
    hasPriority: input.priority !== undefined,
    hasAssigneeId: input.assigneeId !== undefined,
  });

  try {
    const client = createLinearClient(options?.apiKey);
    const issue = await client.issue(input.id);
    if (!issue) {
      throw new Error(`Todo not found for id ${input.id}`);
    }

    const update: Record<string, unknown> = {};

    if (input.title !== undefined) update.title = input.title;

    // Handle description and context - process escape sequences and merge if needed
    if (input.description !== undefined || input.context !== undefined) {
      const existingDescription = issue.description || "";
      const descriptionParts: string[] = [];

      if (typeof input.description === "string") {
        descriptionParts.push(processEscapeSequences(input.description));
      } else if (existingDescription) {
        descriptionParts.push(existingDescription);
      }

      if (typeof input.context === "string" && input.context) {
        descriptionParts.push(
          `\n\nContext: ${processEscapeSequences(input.context)}`,
        );
      }

      if (descriptionParts.length > 0) {
        update.description = descriptionParts.join("");
      }
    }

    if (typeof input.priority === "number") update.priority = input.priority;

    if (input.status) {
      await validateStatus(input.status, options);
      // Skip setting stateId - workflow states are team-specific
      // The status parameter is validated but we let Linear handle state assignment
      // to avoid team/workflow state mismatches
    }

    if (input.assigneeId !== undefined) {
      const teamId = issue.teamId;
      if (teamId) {
        if (input.assigneeId) {
          await validateAssignee(input.assigneeId, teamId, options);
        }
        update.assigneeId = input.assigneeId || null;
      }
    }

    const payload = await client.updateIssue(input.id, update);
    const updated = await resolveIssue(
      payload.issue ?? (await client.issue(input.id)),
      `Failed to update todo ${input.id}`,
    );

    const state = await updated.state;
    const statusName = state?.name?.toLowerCase() || "todo";
    const assignee = await updated.assignee;

    const result: LinearTodo = {
      id: updated.id,
      identifier: updated.identifier,
      title: updated.title,
      description: updated.description || undefined,
      status: normalizeStatus(statusName),
      url: updated.url || undefined,
      priority: updated.priority ?? undefined,
      teamId: updated.teamId || undefined,
      projectId: updated.projectId || undefined,
      labels: undefined,
      assigneeId: assignee?.id || undefined,
    };

    logTodoDebug("updateTodoImpl: success", {
      id: result.id,
      identifier: result.identifier,
      status: result.status,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    logTodoError("updateTodoImpl: failed", error, { id: input.id });
    throw error;
  }
}

export async function deleteTodoImpl(
  id: string,
  options?: { apiKey?: string },
): Promise<void> {
  const startedAt = Date.now();
  logTodoDebug("deleteTodoImpl: start", { id });

  try {
    const client = createLinearClient(options?.apiKey);
    await client.archiveIssue(id);
    logTodoDebug("deleteTodoImpl: success", {
      id,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    logTodoError("deleteTodoImpl: failed", error, { id });
    throw error;
  }
}
