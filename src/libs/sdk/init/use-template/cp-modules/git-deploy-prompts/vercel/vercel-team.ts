import type { GetTeamsResponseBody } from "@vercel/sdk/models/getteamsop";

import { relinka } from "@reliverse/relinka";
import { teamsGetTeam } from "@vercel/sdk/funcs/teamsGetTeam";
import { teamsGetTeams } from "@vercel/sdk/funcs/teamsGetTeams";

import type { InstanceVercel } from "~/libs/sdk/utils/instanceVercel";

import { getReliverseMemory } from "~/libs/sdk/utils/reliverseMemory";

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
}

/**
 * Gets the primary Vercel team details from memory or verifies and returns from API
 */
export async function getPrimaryVercelTeam(
  vercelInstance: InstanceVercel,
  memory: { vercelTeamId?: string; vercelTeamSlug?: string },
): Promise<VercelTeam | undefined> {
  try {
    // First try to verify existing team from memory
    if (memory.vercelTeamId && memory.vercelTeamSlug) {
      const isTeamValid = await verifyTeam(
        vercelInstance,
        memory.vercelTeamId,
        memory.vercelTeamSlug,
      );
      if (isTeamValid) {
        // Get full team details to include name
        const teams = await getVercelTeams(vercelInstance);
        const memoryTeam = teams.find(
          (team) => team.id === memory.vercelTeamId,
        );
        if (memoryTeam) {
          return memoryTeam;
        }
      }
    }

    // If no valid team in memory, get first team from API
    const teams = await getVercelTeams(vercelInstance);
    if (teams?.length > 0 && teams[0]) {
      const team = teams[0];
      // Write to memory for future use
      memory.vercelTeamId = team.id;
      memory.vercelTeamSlug = team.slug;

      // Re-read memory to ensure changes are persisted
      await getReliverseMemory();

      return team;
    }

    return undefined;
  } catch (error) {
    relinka(
      "warn",
      "Error getting primary Vercel team:",
      error instanceof Error ? error.message : String(error),
    );
    return undefined;
  }
}

export async function verifyTeam(
  vercelInstance: InstanceVercel,
  teamId: string,
  teamSlug: string,
): Promise<boolean> {
  try {
    const res = await teamsGetTeam(vercelInstance, {
      teamId,
      slug: teamSlug,
    });

    if (!res.ok) {
      relinka(
        "warn",
        "Failed to verify team:",
        res.error?.message ?? "Unknown error",
      );
      return false;
    }

    return true;
  } catch (error) {
    relinka(
      "warn",
      "Error verifying team:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

export async function getVercelTeams(
  vercelInstance: InstanceVercel,
): Promise<VercelTeam[]> {
  const res = await teamsGetTeams(vercelInstance, {
    limit: 10,
  });

  if (!res.ok) {
    throw res.error;
  }

  const { teams } = res.value;
  return teams
    .filter(
      (team): team is GetTeamsResponseBody["teams"][0] & { name: string } =>
        team.name !== null,
    )
    .map((team) => ({
      id: team.id,
      slug: team.slug,
      name: team.name,
    }));
}
