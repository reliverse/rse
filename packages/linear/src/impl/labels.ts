import type { LinearClient } from "@linear/sdk";

export async function ensureLabels(
  client: LinearClient,
  teamId: string | undefined,
  labelNames: string[] | undefined,
): Promise<string[] | undefined> {
  if (!labelNames || labelNames.length === 0) return undefined;

  const existingLabelsConn = await client.issueLabels({ first: 100 });
  const existingLabels = existingLabelsConn.nodes;

  const labelIds: string[] = [];

  for (const name of labelNames) {
    const existing = existingLabels.find((l) => l.name === name);
    if (existing?.id) {
      labelIds.push(existing.id);
      continue;
    }
    const created = (await client.createIssueLabel({
      name,
      ...(teamId ? { teamId } : {}),
    })) as { label?: { id?: string } | null };

    if (created.label?.id) {
      labelIds.push(created.label.id);
    }
  }

  return labelIds;
}

export async function validateLabels(
  client: LinearClient,
  labelNames: string[] | undefined,
): Promise<string[]> {
  if (!labelNames || labelNames.length === 0) return [];

  const existingLabelsConn = await client.issueLabels({ first: 100 });
  const existingLabels = existingLabelsConn.nodes ?? [];

  const labelIds: string[] = [];
  const missingLabels: string[] = [];

  for (const name of labelNames) {
    const existing = existingLabels.find((l) => l.name === name);
    if (existing?.id) {
      labelIds.push(existing.id);
    } else {
      missingLabels.push(name);
    }
  }

  if (missingLabels.length > 0) {
    const availableLabels = existingLabels
      .map((l) => `  - ${l.name}`)
      .join("\n");
    const labelsList = availableLabels || "  (no labels found)";
    throw new Error(
      `The following Linear label(s) do not exist: ${missingLabels.join(", ")}.\n\nAvailable labels:\n${labelsList}\n\nCreate labels via Linear dashboard before using them.`,
    );
  }

  return labelIds;
}
