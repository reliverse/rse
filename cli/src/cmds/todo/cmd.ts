import {
  createLinearClient,
  createTodo,
  deleteTodo,
  getTodo,
  type LinearTodoStatus,
  isValidStatusKeyword,
  listTodoProjects,
  listTodos,
  listTodoTeams,
  normalizeStatus,
  updateTodo,
  validateAssignee,
  validateLabels,
  validateStatus,
  validateTodoTeamId, 
} from "@p/linear";
import { confirmPrompt, defineArgs, defineCommand } from "@reliverse/rempts";
import { formatTable, printError, printHeader, printInfo, printSuccess } from "~/utils/interactive";

type TodoAction = "list" | "get" | "create" | "update" | "delete" | "projects" | "teams";

type LinearModule = typeof import("@p/linear");

let linearCreateClient: LinearModule["createLinearClient"] | undefined;

const linearEnv = (() => {
  try {
    // Read once at module load to avoid re-reading env on every command.
    // Safe in Bun + Node per @p/linear env implementation.
    const linear = require("@p/linear") as LinearModule;
    linearCreateClient = linear.createLinearClient;
    return linear.getLinearEnvConfig();
  } catch {
    return {};
  }
})();

export default defineCommand({
  meta: {
    name: "todo",
    description: "Manage Linear-based todos (issues) with full CRUD support",
  },
  args: defineArgs({
    action: {
      type: "string",
      required: true,
      allowed: ["list", "get", "create", "update", "delete", "projects", "teams"],
      description: "Action to perform: list, get, create, update, delete, projects, teams",
    },
    id: {
      type: "string",
      description: "Todo id (Linear issue id) for get, update, or delete",
    },
    title: {
      type: "string",
      description: "Title for the todo (required for create, optional for update)",
    },
    description: {
      type: "string",
      description: "Description for the todo",
    },
    context: {
      type: "string",
      description: "Optional context for grouping (stored in description)",
    },
    status: {
      type: "string",
      description:
        "Status for the todo (falls back to LINEAR_DEFAULT_STATUS for create, required for update). For list action, supports comma-separated values like 'todo,backlog'. Supports all Linear workflow statuses: Backlog (icebox, backlog), Unstarted (todo), Started (in_progress, in_review, ready_to_merge), Completed (done, completed), Canceled (canceled, could_not_reproduce, wont_fix, duplicate). Statuses are normalized to: backlog, todo, in_progress, done, canceled",
    },
    priority: {
      type: "number",
      description: "Priority 0-4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low)",
    },
    assigneeId: {
      type: "string",
      description:
        "Assignee id (Linear user id) to assign the todo to (falls back to LINEAR_DEFAULT_ASSIGNEE_ID)",
    },
    teamId: {
      type: "string",
      description:
        "Linear team id to attach todos to (falls back to LINEAR_DEFAULT_TEAM_ID environment variable)",
    },
    projectId: {
      type: "string",
      description:
        "Optional Linear project id to attach todos to (falls back to LINEAR_DEFAULT_PROJECT_ID)",
    },
    projectName: {
      type: "string",
      description:
        "Optional Linear project name to attach todos to (mutually exclusive with --projectId)",
    },
    labels: {
      type: "string",
      description:
        "Comma-separated list of label names to apply (created automatically if missing)",
    },
    interactive: {
      type: "boolean",
      description: "Enable interactive prompts for missing required values",
      default: false,
    },
    limit: {
      type: "number",
      description: "Maximum number of todos to list (for action=list, default 20)",
    },
  }),
  async run({ args }) {
    const action = args.action as TodoAction;
    const interactive = Boolean(args.interactive);

    try {
      // Validate env config early - fail fast if LINEAR_DEFAULT_TEAM_ID, LINEAR_DEFAULT_PROJECT_ID, LINEAR_DEFAULT_LABEL, LINEAR_DEFAULT_STATUS, LINEAR_DEFAULT_ASSIGNEE_ID, or LINEAR_DEFAULT_PRIORITY are misconfigured
      if (linearEnv.todoTeamId && linearEnv.todoTeamId.length > 0) {
        await validateTodoTeamId(linearEnv.todoTeamId);
      }
      if (linearEnv.todoProjectId && linearEnv.todoProjectId.length > 0) {
        await validateProjectIdOrThrow(linearEnv.todoProjectId);
      }
      if (linearEnv.todoLabel && linearEnv.todoLabel.length > 0) {
        await validateLabelOrThrow(linearEnv.todoLabel);
      }
      if (linearEnv.todoStatus && linearEnv.todoStatus.length > 0) {
        await validateStatusOrThrow(linearEnv.todoStatus);
      }
      if (
        linearEnv.todoAssigneeId &&
        linearEnv.todoAssigneeId.length > 0 &&
        linearEnv.todoTeamId &&
        linearEnv.todoTeamId.length > 0
      ) {
        await validateAssignee(linearEnv.todoAssigneeId, linearEnv.todoTeamId);
      }
      if (
        typeof linearEnv.todoPriority === "number" &&
        (linearEnv.todoPriority < 0 || linearEnv.todoPriority > 4)
      ) {
        throw new Error(
          "LINEAR_DEFAULT_PRIORITY must be between 0 and 4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low).",
        );
      }

      printInfo(
        `Running todo action "${action}" with args: ${JSON.stringify({
          id: args.id,
          status: args.status,
          priority: args.priority,
          teamId: args.teamId,
          projectId: args.projectId ?? args.projectName,
          labels: args.labels,
          limit: args.limit,
        })}`,
      );

      if (action === "list") {
        const teamId = (args.teamId as string | undefined) ?? linearEnv.todoTeamId;
        if (typeof teamId === "string" && teamId.length > 0) {
          await validateTodoTeamId(teamId);
        }
        const projectId = await resolveProjectIdForArgs(
          {
            projectId: args.projectId,
            projectName: args.projectName,
          },
          linearEnv.todoProjectId,
        );

        // Parse comma-separated status values
        let statusFilter: LinearTodoStatus | LinearTodoStatus[] | undefined;
        if (args.status) {
          const statusString = String(args.status);
          const statusValues = statusString
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          if (statusValues.length === 0) {
            statusFilter = undefined;
          } else {
            // Validate all status values before normalizing
            const invalidStatuses: string[] = [];
            for (const statusValue of statusValues) {
              if (!isValidStatusKeyword(statusValue)) {
                invalidStatuses.push(statusValue);
              }
            }

            if (invalidStatuses.length > 0) {
              const validStatuses = [
                "backlog",
                "icebox",
                "unstarted",
                "planned",
                "todo",
                "in_progress",
                "in_review",
                "ready_to_merge",
                "done",
                "completed",
                "canceled",
                "could_not_reproduce",
                "wont_fix",
                "duplicate",
              ];
              throw new Error(
                `Invalid status(es): ${invalidStatuses.join(", ")}. Valid statuses include: ${validStatuses.join(", ")}`,
              );
            }

            if (statusValues.length === 1) {
              // For list action, use normalizeStatus instead of validateStatus since we're filtering,
              // not setting a status (validateStatus checks against Linear's workflow states which may vary)
              statusFilter = normalizeStatus(statusValues[0]!);
            } else {
              // Normalize all statuses and convert to array
              const normalizedStatuses: LinearTodoStatus[] = [];
              for (const statusValue of statusValues) {
                const normalized = normalizeStatus(statusValue);
                // Avoid duplicates
                if (!normalizedStatuses.includes(normalized)) {
                  normalizedStatuses.push(normalized);
                }
              }
              statusFilter =
                normalizedStatuses.length === 1 ? normalizedStatuses[0] : normalizedStatuses;
            }
          }
        }

        printInfo(
          `Listing todos with filters: ${JSON.stringify({
            teamId,
            projectId,
            status: statusFilter,
            limit: args.limit ?? 20,
          })}`,
        );

        const startedAt = Date.now();
        const todos = await handleList({
          limit: args.limit,
          status: statusFilter,
          teamId,
          projectId,
        });
        const durationMs = Date.now() - startedAt;
        printInfo(`Listed ${todos.length} todos in ${durationMs}ms.`);
        return;
      }

      if (action === "projects") {
        const startedAt = Date.now();
        await handleListProjects();
        const durationMs = Date.now() - startedAt;
        printInfo(`Listed todo projects in ${durationMs}ms.`);
        return;
      }

      if (action === "teams") {
        const startedAt = Date.now();
        await handleListTeams();
        const durationMs = Date.now() - startedAt;
        printInfo(`Listed todo teams in ${durationMs}ms.`);
        return;
      }

      if (action === "get") {
        const id = await requireArg("id", args.id, interactive);
        printInfo(`Fetching todo with id: ${id}`);
        const startedAt = Date.now();
        await handleGet(id);
        const durationMs = Date.now() - startedAt;
        printInfo(`Finished fetching todo ${id} in ${durationMs}ms.`);
        return;
      }

      if (action === "create") {
        const title = await requireArg("title", args.title, interactive);
        // Ensure description is a string (reject boolean/number - these indicate arg parser errors)
        printInfo(
          `Raw args.description: type=${typeof args.description}, value=${JSON.stringify(args.description)}`,
        );
        let description: string | undefined;
        if (args.description != null) {
          if (typeof args.description === "string") {
            // Reject the string "true" as it likely indicates a parsing error
            if (args.description === "true" || args.description === "false") {
              throw new Error(
                `--description was parsed as the string "${args.description}" which indicates an argument parsing issue. The description value may have been lost.\n\n` +
                  `This usually happens when the description value starts with '-' and is not properly quoted in PowerShell.\n\n` +
                  `Try using: --description "your description here" with proper PowerShell quoting, or use --description='your description here'`,
              );
            } else {
              description = args.description;
              // Trim leading "-" if present (handles cases where PowerShell interprets it as a flag)
              if (description.startsWith("-") && description.length > 1) {
                const originalDescription = description;
                description = description.substring(1).trimStart();
                printInfo(
                  `Trimmed leading "-" from description. Original: "${originalDescription.substring(0, 50)}...", Trimmed: "${description.substring(0, 50)}..."`,
                );
              }
              // Convert alternative escape sequences (|n, |t) to standard ones (\n, \t)
              description = normalizeEscapeSequences(description);
              printInfo(
                `Description parsed successfully: length=${description.length}, preview=${description.substring(0, 100)}`,
              );
            }
          } else {
            throw new Error(
              `--description was parsed as ${typeof args.description} (value: ${JSON.stringify(args.description)}) instead of string. This indicates an argument parsing issue.\n\n` +
                `This usually happens when the description value starts with '-' and is not properly quoted, or when --description is used as a boolean flag.\n\n` +
                `Try using: --description "your description here" with proper PowerShell quoting, or use --description='your description here'`,
            );
          }
        } else {
          printInfo("No description provided (args.description is null/undefined)");
        }
        // Ensure context is a string (reject boolean/number - these indicate arg parser errors)
        let context: string | undefined;
        if (args.context != null) {
          if (typeof args.context === "string") {
            context = normalizeEscapeSequences(args.context);
          } else {
            throw new Error(
              `--context was parsed as ${typeof args.context} (value: ${JSON.stringify(args.context)}) instead of string. This indicates an argument parsing issue.\n\n` +
                `Try using: --context "your context here" with proper PowerShell quoting, or use --context='your context here'`,
            );
          }
        }
        const teamId = (args.teamId as string | undefined) ?? linearEnv.todoTeamId;
        if (typeof teamId === "string" && teamId.length > 0) {
          await validateTodoTeamId(teamId);
        }
        const projectId = await resolveProjectIdForArgs(
          {
            projectId: args.projectId,
            projectName: args.projectName,
          },
          linearEnv.todoProjectId,
        );
        const labelsFromArgs =
          typeof args.labels === "string" ? splitLabels(args.labels) : undefined;
        const labels = labelsFromArgs ?? (linearEnv.todoLabel ? [linearEnv.todoLabel] : undefined);
        const priority = normalizePriority(args.priority) ?? linearEnv.todoPriority;
        const statusInput = args.status as LinearTodoStatus | undefined;
        const status = statusInput
          ? await validateStatus(statusInput).then((s) => s)
          : linearEnv.todoStatus
            ? await validateStatus(linearEnv.todoStatus).then((s) => s)
            : undefined;
        const assigneeId = (args.assigneeId as string | undefined) ?? linearEnv.todoAssigneeId;
        if (assigneeId && teamId) {
          await validateAssignee(assigneeId, teamId);
        }

        printInfo(
          `Creating todo in Linear with payload: ${JSON.stringify({
            title,
            hasDescription: Boolean(description),
            descriptionType: typeof description,
            descriptionLength: typeof description === "string" ? description.length : 0,
            descriptionPreview:
              typeof description === "string" ? description.substring(0, 100) : String(description),
            context,
            teamId,
            projectId,
            labels,
            priority,
            status,
            assigneeId,
          })}`,
        );

        const startedAt = Date.now();
        const created = await handleCreate({
          title,
          description,
          context,
          teamId,
          projectId,
          labels,
          priority,
          status,
          assigneeId,
        });
        const durationMs = Date.now() - startedAt;
        printInfo(`Created todo ${created.identifier} (id=${created.id}) in ${durationMs}ms.`);
        return;
      }

      if (action === "update") {
        const id = await requireArg("id", args.id, interactive);
        const title =
          typeof args.title === "string"
            ? args.title
            : args.title !== undefined && args.title !== null
              ? String(args.title)
              : undefined;
        // Ensure description is a string (reject boolean/number - these indicate arg parser errors)
        const description =
          typeof args.description === "string"
            ? normalizeEscapeSequences(args.description)
            : undefined;
        if (args.description != null && typeof args.description !== "string") {
          printError(
            `Warning: --description was parsed as ${typeof args.description} instead of string. This may indicate an argument parsing issue. Description will be omitted.`,
          );
        }
        // Ensure context is a string (reject boolean/number - these indicate arg parser errors)
        const context =
          typeof args.context === "string" ? normalizeEscapeSequences(args.context) : undefined;
        if (args.context != null && typeof args.context !== "string") {
          printError(
            `Warning: --context was parsed as ${typeof args.context} instead of string. This may indicate an argument parsing issue. Context will be omitted.`,
          );
        }
        const statusInput = args.status as LinearTodoStatus | undefined;
        const status = statusInput ? await validateStatus(statusInput).then((s) => s) : undefined;
        const priority = normalizePriority(args.priority);
        const assigneeId = args.assigneeId as string | undefined;
        // Note: assigneeId validation happens in updateTodoImpl after we get the issue's teamId

        printInfo(
          `Updating todo ${id} with changes: ${JSON.stringify({
            hasTitle: title !== undefined,
            hasDescription: description !== undefined,
            context,
            status,
            priority,
            assigneeId,
          })}`,
        );

        const startedAt = Date.now();
        const updated = await handleUpdate({
          id,
          title,
          description,
          context,
          status,
          priority,
          assigneeId,
        });
        const durationMs = Date.now() - startedAt;
        printInfo(`Updated todo ${updated.identifier} (id=${updated.id}) in ${durationMs}ms.`);
        return;
      }

      if (action === "delete") {
        const id = await requireArg("id", args.id, interactive);
        printInfo(`Archiving todo ${id} in Linear (interactive=${interactive}).`);
        const startedAt = Date.now();
        await handleDelete(id, interactive);
        const durationMs = Date.now() - startedAt;
        printInfo(`Archived todo ${id} in ${durationMs}ms.`);
        return;
      }

      printError(`Unsupported action: ${String(action)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      printError("Todo command failed", message);
      process.exitCode = 1;
    }
  },
});

function splitLabels(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Convert alternative escape sequences (|n, |t, etc.) to standard escape sequences (\n, \t, etc.)
 * Supports both \n and |n syntax for better PowerShell compatibility
 */
function normalizeEscapeSequences(text: string): string {
  return text
    .replace(/\|n/g, "\n")
    .replace(/\|t/g, "\t")
    .replace(/\|r/g, "\r")
    .replace(/\|\\/g, "\\")
    .replace(/\|"/g, '"')
    .replace(/\|'/g, "'");
}

function normalizePriority(raw: unknown): number | undefined {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return undefined;
  }
  const value = Math.trunc(raw);
  if (value < 0 || value > 4) {
    throw new Error(
      "Priority must be between 0 and 4 (0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low).",
    );
  }
  return value;
}

type ProjectArgs = {
  projectId?: unknown;
  projectName?: unknown;
};

async function validateProjectIdOrThrow(projectId: string): Promise<void> {
  const projects = await listTodoProjects();
  const found = projects.some((p) => p.id === projectId);
  if (!found) {
    const availableProjects = projects.map((p) => `  - ${p.id} (${p.name})`).join("\n");
    const projectsList = availableProjects || "  (no projects found)";
    throw new Error(
      `No Linear project found for id "${projectId}".\n\nAvailable projects:\n${projectsList}\n\nRun "bun cli todo --action projects" to list valid project ids.`,
    );
  }
}

async function validateLabelOrThrow(labelName: string): Promise<void> {
  const client = createLinearClient();
  await validateLabels(client, [labelName]);
}

async function validateStatusOrThrow(statusName: string): Promise<void> {
  await validateStatus(statusName);
}

async function resolveProjectIdForArgs(
  args: ProjectArgs,
  defaultProjectId?: string,
): Promise<string | undefined> {
  const projectIdArg =
    typeof args.projectId === "string" && args.projectId.length > 0 ? args.projectId : undefined;
  const projectNameArg =
    typeof args.projectName === "string" && args.projectName.length > 0
      ? args.projectName
      : undefined;

  if (projectIdArg && projectNameArg) {
    throw new Error("Use either --projectId or --projectName, not both.");
  }

  if (projectIdArg) {
    await validateProjectIdOrThrow(projectIdArg);
    return projectIdArg;
  }
  if (projectNameArg) return await resolveProjectIdByName(projectNameArg);
  return defaultProjectId;
}

async function resolveProjectIdByName(projectName: string): Promise<string> {
  if (!linearCreateClient) {
    throw new Error(
      "Linear client is not available. Ensure @p/linear is installed and properly configured.",
    );
  }

  const client = linearCreateClient();
  const projectsConn = await client.projects({ first: 100 });
  const projects = projectsConn.nodes;
  const lower = projectName.toLowerCase();

  const exact = projects.find((p) => p.name.toLowerCase() === lower);
  const candidate = exact ?? projects.find((p) => p.name.toLowerCase().includes(lower));

  if (!candidate) {
    throw new Error(`No Linear project found matching name "${projectName}".`);
  }

  return candidate.id;
}

async function requireArg(name: string, value: unknown, interactive: boolean): Promise<string> {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (!interactive) {
    throw new Error(
      `Missing required --${name} argument. Re-run with --interactive to be prompted.`,
    );
  }

  const confirmed = await confirmPrompt({
    message: `Required argument --${name} is missing. Abort operation?`,
    defaultValue: false,
  });

  if (confirmed) {
    throw new Error(`Operation aborted because required argument --${name} was missing.`);
  }

  throw new Error(
    `Interactive input for --${name} is not implemented yet. Please pass --${name} explicitly.`,
  );
}

async function handleList(input: {
  limit?: unknown;
  status?: LinearTodoStatus | LinearTodoStatus[];
  teamId?: string;
  projectId?: string;
}) {
  const limit =
    typeof input.limit === "number" && Number.isFinite(input.limit) && input.limit > 0
      ? input.limit
      : 20;

  printHeader("Todos (Linear Issues)");
  const todos = await listTodos({
    limit,
    status: input.status,
    teamId: input.teamId,
    projectId: input.projectId,
  });

  if (todos.length === 0) {
    printInfo("No todos found.");
    return [];
  }

  formatTable(
    todos.map((t) => ({
      id: t.id,
      key: t.identifier,
      title: t.title,
      status: t.status,
      priority: t.priority ?? "",
    })),
    ["id", "key", "title", "status", "priority"],
  );
  return todos;
}

async function handleListProjects() {
  printHeader("Todo projects (Linear)");

  const projects = await listTodoProjects();

  if (projects.length === 0) {
    printInfo("No todo projects found in Linear.");
    return;
  }

  const defaultProjectId =
    typeof linearEnv.todoProjectId === "string" && linearEnv.todoProjectId.length > 0
      ? linearEnv.todoProjectId
      : undefined;

  formatTable(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      default: defaultProjectId && p.id === defaultProjectId ? "yes" : "",
    })),
    ["id", "name", "default"],
  );
}

async function handleListTeams() {
  printHeader("Todo teams (Linear)");

  const teams = await listTodoTeams();

  if (teams.length === 0) {
    printInfo("No todo teams found in Linear.");
    return;
  }

  const defaultTeamId =
    typeof linearEnv.todoTeamId === "string" && linearEnv.todoTeamId.length > 0
      ? linearEnv.todoTeamId
      : undefined;

  formatTable(
    teams.map((t) => ({
      id: t.id,
      name: t.name,
      default: defaultTeamId && t.id === defaultTeamId ? "yes" : "",
    })),
    ["id", "name", "default"],
  );
}

async function handleGet(id: string) {
  printHeader(`Todo details: ${id}`);
  const todo = await getTodo(id);
  if (!todo) {
    printError("Todo not found");
    return;
  }

  const data = [
    { field: "ID", value: todo.id },
    { field: "Key", value: todo.identifier },
    { field: "Title", value: todo.title },
    { field: "Status", value: todo.status },
    { field: "Priority", value: todo.priority ?? "" },
    { field: "URL", value: todo.url ?? "" },
  ];

  formatTable(
    data.map((row) => ({ field: row.field, value: String(row.value) })),
    ["field", "value"],
  );

  // Display description separately if it exists (can be multi-line)
  if (todo.description && todo.description.trim().length > 0) {
    printInfo("\nDescription:");
    console.log(todo.description);
  } else {
    printInfo("\nDescription: (none)");
  }
}

async function handleCreate(input: {
  title: string;
  description?: string;
  context?: string;
  teamId?: string;
  projectId?: string;
  labels?: string[];
  priority?: number;
  status?: LinearTodoStatus;
  assigneeId?: string;
}) {
  printHeader("Create todo");
  const todo = await createTodo(input);
  printSuccess(`Created todo ${todo.identifier}`);
  return todo;
}

async function handleUpdate(input: {
  id: string;
  title?: string;
  description?: string;
  context?: string;
  status?: LinearTodoStatus;
  priority?: number;
  assigneeId?: string;
}) {
  printHeader(`Update todo ${input.id}`);

  const existing = await getTodo(input.id);
  if (!existing) {
    printError("Todo not found");
    throw new Error(`Todo not found for id ${input.id}`);
  }

  const mergedDescription =
    input.description !== undefined ? input.description : existing.description;

  const updated = await updateTodo({
    id: input.id,
    title: input.title,
    description: mergedDescription,
    status: input.status,
    priority: input.priority,
    context: input.context,
  });

  printSuccess(`Updated todo ${updated.identifier}`);
  return updated;
}

async function handleDelete(id: string, interactive: boolean) {
  if (interactive) {
    const confirmed = await confirmPrompt({
      message: `Are you sure you want to archive todo ${id}?`,
      defaultValue: false,
    });
    if (!confirmed) {
      printInfo("Delete operation cancelled.");
      return;
    }
  }

  await deleteTodo(id);
  printSuccess(`Todo ${id} archived in Linear.`);
}
