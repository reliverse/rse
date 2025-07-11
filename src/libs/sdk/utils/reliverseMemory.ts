import path from "@reliverse/pathkit";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { eq } from "drizzle-orm";

import { memoryPath } from "~/libs/sdk/constants";
import { db } from "~/libs/sdk/db/client";
import { encrypt, decrypt } from "~/libs/sdk/db/config";
import { configKeysTable, userDataTable } from "~/libs/sdk/db/schema";

import type {
  EncryptedDataMemory,
  ReliverseMemory,
  UserDataMemory,
} from "./schemaMemory";

export async function getOrCreateReliverseMemory(): Promise<ReliverseMemory> {
  // Ensure directory exists
  if (!(await fs.pathExists(path.dirname(memoryPath)))) {
    await ensuredir(path.dirname(memoryPath));
  }

  try {
    // Read encrypted data from config_keys
    const configRows = await db.select().from(configKeysTable);

    // Process encrypted data
    const configData: Record<string, string> = {};
    for (const row of configRows) {
      try {
        const decrypted = await decrypt(row.value);
        // Try to parse JSON if the value looks like JSON
        try {
          if (decrypted.startsWith("{") || decrypted.startsWith("[")) {
            configData[row.key] = JSON.parse(decrypted) as string;
          } else {
            configData[row.key] = decrypted;
          }
        } catch {
          configData[row.key] = decrypted;
        }
      } catch {
        configData[row.key] = "";
      }
    }

    // Read non-encrypted data from user_data
    const userRows = await db.select().from(userDataTable);
    const userData = userRows.reduce<Record<string, string>>((acc, row) => {
      try {
        // Try to parse JSON if the value looks like JSON
        if (row.value.startsWith("{") || row.value.startsWith("[")) {
          acc[row.key] = JSON.parse(row.value) as string;
        } else {
          acc[row.key] = row.value;
        }
      } catch {
        acc[row.key] = row.value;
      }
      return acc;
    }, {});

    return {
      // Encrypted data
      code: configData.code ?? "",
      key: configData.key ?? "",
      githubKey: configData.githubKey ?? "",
      vercelKey: configData.vercelKey ?? "",
      openaiKey: configData.openaiKey ?? "",
      // Non-encrypted data
      name: userData.name ?? "",
      email: userData.email ?? "",
      githubUsername: userData.githubUsername ?? "",
      vercelTeamId: userData.vercelTeamId ?? "",
      vercelTeamSlug: userData.vercelTeamSlug ?? "",
    };
  } catch (error) {
    relinka(
      "error",
      "Error reading memory:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      code: "",
      key: "",
      githubKey: "",
      vercelKey: "",
      openaiKey: "",
      name: "",
      email: "",
      githubUsername: "",
      vercelTeamSlug: "",
      vercelTeamId: "",
    };
  }
}

export async function updateReliverseMemory(
  data: Partial<ReliverseMemory>,
): Promise<void> {
  try {
    // Split updates into encrypted and non-encrypted data
    const encryptedEntries = Object.entries(data)
      .filter(([key]) =>
        ["code", "key", "githubKey", "vercelKey", "openaiKey"].includes(key),
      )
      .filter(([_, value]) => value !== null && value !== undefined);

    // Process encrypted data
    const configUpdates: { key: EncryptedDataMemory; value: string }[] = [];
    for (const [key, value] of encryptedEntries) {
      const stringValue =
        typeof value === "object"
          ? JSON.stringify(value)
          : typeof value === "undefined"
            ? ""
            : String(value);

      const encryptedValue = await encrypt(stringValue);
      configUpdates.push({
        key: key as EncryptedDataMemory,
        value: encryptedValue,
      });
    }

    const userDataUpdates = Object.entries(data)
      .filter(([key]) =>
        [
          "name",
          "email",
          "githubUsername",
          "vercelTeamSlug",
          "vercelTeamId",
        ].includes(key),
      )
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        key: key as UserDataMemory,
        value:
          typeof value === "object"
            ? JSON.stringify(value)
            : typeof value === "undefined"
              ? ""
              : String(value),
      }));

    // Delete entries that are explicitly set to null
    const keysToDelete = Object.entries(data)
      .filter(([key]) =>
        ["code", "key", "githubKey", "vercelKey", "openaiKey"].includes(key),
      )
      .filter(([_, value]) => value === null)
      .map(([key]) => key as EncryptedDataMemory);

    // Delete null entries from config_keys
    for (const key of keysToDelete) {
      await db.delete(configKeysTable).where(eq(configKeysTable.key, key));
    }

    // Update encrypted data in config_keys
    for (const update of configUpdates) {
      await db
        .insert(configKeysTable)
        .values(update)
        .onConflictDoUpdate({
          target: configKeysTable.key,
          set: { value: update.value },
        });
    }

    // Update non-encrypted data in user_data
    for (const update of userDataUpdates) {
      await db
        .insert(userDataTable)
        .values(update)
        .onConflictDoUpdate({
          target: userDataTable.key,
          set: { value: update.value },
        });
    }

    relinka("verbose", "Memory updated successfully");
  } catch (error) {
    relinka(
      "error",
      "Error updating memory:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
