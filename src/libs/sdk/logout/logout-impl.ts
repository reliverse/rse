import { relinka } from "@reliverse/relinka";
import fs from "@reliverse/relifso";

import { memoryPath } from "~/libs/sdk/utils/rseConfig/cfg-details.js";

export async function deleteMemory() {
  relinka("verbose", `Deleting config file: ${memoryPath}`);

  try {
    if (await fs.pathExists(memoryPath)) {
      await fs.remove(memoryPath);
      relinka("verbose", "Config file deleted successfully");
    } else {
      relinka("verbose", "Config file not found");
    }
  } catch (error) {
    relinka(
      "error",
      "Failed to delete config file",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
