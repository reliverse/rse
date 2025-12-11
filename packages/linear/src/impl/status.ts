export type LinearTodoStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "done"
  | "canceled";

/**
 * Check if a status string contains any valid status keywords
 * @param status The status string to validate
 * @returns true if the status contains valid keywords, false otherwise
 */
export function isValidStatusKeyword(status: string): boolean {
  const lower = status.toLowerCase();
  return (
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
    lower.includes("duplicate")
  );
}

export function normalizeStatus(name: string): LinearTodoStatus {
  const lower = name.toLowerCase();

  // Backlog: Icebox, Backlog
  if (lower.includes("icebox") || lower.includes("backlog")) return "backlog";

  // Unstarted: Todo
  if (
    lower.includes("unstarted") ||
    lower.includes("todo") ||
    lower.includes("to do")
  ) {
    return "todo";
  }

  // Planned maps to todo (for project statuses)
  if (lower.includes("planned")) return "todo";

  // Started: In Progress, In Review, Ready to Merge
  if (lower.includes("ready to merge") || lower.includes("ready_to_merge")) {
    return "in_progress";
  }
  // In Review is a sub-status of In Progress - check before "in progress" to match more specifically
  if (lower.includes("in review") || lower.includes("in_review"))
    return "in_progress";
  if (
    lower.includes("in progress") ||
    lower.includes("in_progress") ||
    lower.includes("started")
  ) {
    return "in_progress";
  }

  // Completed: Done
  if (lower.includes("done") || lower.includes("completed")) return "done";

  // Canceled: Canceled, Could not reproduce, Won't Fix, Duplicate
  if (
    lower.includes("cancel") ||
    lower.includes("canceled") ||
    lower.includes("cancelled") ||
    lower.includes("could not reproduce") ||
    lower.includes("could_not_reproduce") ||
    lower.includes("won't fix") ||
    lower.includes("wont fix") ||
    lower.includes("wont_fix") ||
    lower.includes("duplicate")
  ) {
    return "canceled";
  }

  return "todo";
}
