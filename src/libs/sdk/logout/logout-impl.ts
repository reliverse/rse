import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";

import { memoryPath } from "~/libs/sdk/constants";

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
