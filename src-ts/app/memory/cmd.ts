import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { getOrCreateReliverseMemory } from "~/app/utils/reliverseMemory";

export default defineCommand({
  meta: {
    name: "memory",
    description: "Displays the data stored in rseory",
    hidden: true,
  },
  run: async () => {
    const memory = await getOrCreateReliverseMemory();
    relinka("info", "Current memory values:");
    console.log({
      code: memory.code === "" ? "" : "exists",
      key: memory.key === "" ? "" : "exists",
      githubKey: memory.githubKey === "" ? "" : "exists",
      vercelKey: memory.vercelKey === "" ? "" : "exists",
      name: memory.name ?? "",
      email: memory.email ?? "",
      githubUsername: memory.githubUsername ?? "",
      vercelTeamSlug: memory.vercelTeamSlug ?? "",
      vercelTeamId: memory.vercelTeamId ?? "",
    });
    process.exit(0);
  },
});
