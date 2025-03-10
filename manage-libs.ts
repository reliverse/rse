/**
 * Library Management Script
 *
 * This script provides utilities to manage libraries in build.config.ts.
 * It helps with adding, removing, and listing libraries.
 */

import fs from "fs-extra";
import path from "pathe";
import { fileURLToPath } from "url";

import { pubConfig, type LibConfig } from "./build.config.js";
import { cleanupDeprecatedLibsFile } from "./build.publish.js";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD_CONFIG_PATH = path.join(ROOT_DIR, "build.config.ts");

// Simple logger
const logger = {
  info: (message: string) => console.log(`\x1b[36minfo\x1b[0m: ${message}`),
  success: (message: string) =>
    console.log(`\x1b[32msuccess\x1b[0m: ${message}`),
  warn: (message: string) => console.log(`\x1b[33mwarn\x1b[0m: ${message}`),
  error: (message: string, error?: unknown) => {
    console.error(`\x1b[31merror\x1b[0m: ${message}`);
    if (error) console.error(error);
  },
};

/**
 * Lists all configured libraries
 */
async function listLibraries(): Promise<void> {
  const libs = pubConfig.libs || {};
  const libCount = Object.keys(libs).length;

  if (libCount === 0) {
    logger.info("No libraries configured.");
    return;
  }

  logger.info(
    `Found ${libCount} configured ${libCount === 1 ? "library" : "libraries"}:`,
  );

  for (const [name, config] of Object.entries(libs) as [string, LibConfig][]) {
    logger.info(`- ${name}`);
    logger.info(`  Main: ${config.main}`);
    if (config.description) {
      logger.info(`  Description: ${config.description}`);
    }
  }
}

/**
 * Adds or updates a library configuration in build.config.ts
 */
async function addLibrary(
  name: string,
  main: string,
  description?: string,
): Promise<void> {
  try {
    if (!name) {
      throw new Error("Library name is required");
    }

    if (!main) {
      throw new Error("Main entry file path is required");
    }

    // Read the current build.config.ts file
    const content = await fs.readFile(BUILD_CONFIG_PATH, "utf8");

    // Check if libraries section exists
    const libsRegex = /libs\s*:\s*{([\s\S]*?)}/s;
    const libsMatch = libsRegex.exec(content);

    let newContent: string;

    if (libsMatch) {
      // Check if the library already exists
      const libRegex = new RegExp(`"${name}"\\s*:\\s*{[\\s\\S]*?}`, "g");
      const libExists = libRegex.test(libsMatch[1]!);

      const newLibConfig = `"${name}": {
      main: "${main}"${
        description
          ? `,
      description: "${description}"`
          : ""
      }
    }`;

      if (libExists) {
        // Update existing library
        newContent = content.replace(libRegex, newLibConfig);
        logger.success(`Updated library "${name}"`);
      } else {
        // Add new library
        const lastBraceIndex = libsMatch[1]!.lastIndexOf("}");
        const hasOtherLibs = lastBraceIndex !== -1;

        newContent = content.replace(
          libsMatch[0],
          `libs: {${libsMatch[1]}${hasOtherLibs ? "," : ""}
    ${newLibConfig}
  }`,
        );
        logger.success(`Added library "${name}"`);
      }
    } else {
      // Add libs section if it doesn't exist
      const configEndRegex =
        /pubConfig\s*:\s*BuildPublishConfig\s*=\s*{[\s\S]*?};\s*?\n/s;
      const configEndMatch = configEndRegex.exec(content);

      if (!configEndMatch) {
        throw new Error(
          "Could not locate pubConfig section in build.config.ts",
        );
      }

      const newLibsSection = `  // Library configurations
  libs: {
    "${name}": {
      main: "${main}"${
        description
          ? `,
      description: "${description}"`
          : ""
      }
    }
  }
};`;

      newContent = content.replace(/};\s*?\n/s, newLibsSection);
      logger.success(`Added library "${name}" and created libs section`);
    }

    // Write the updated content back to the file
    await fs.writeFile(BUILD_CONFIG_PATH, newContent, "utf8");

    // Clean up the deprecated build.libs.jsonc if it exists
    await cleanupDeprecatedLibsFile();
  } catch (error) {
    logger.error(`Failed to add/update library "${name}":`, error);
  }
}

/**
 * Removes a library from the configuration
 */
async function removeLibrary(name: string): Promise<void> {
  try {
    if (!name) {
      throw new Error("Library name is required");
    }

    // Read the current build.config.ts file
    const content = await fs.readFile(BUILD_CONFIG_PATH, "utf8");

    // Check if libraries section exists
    const libsRegex = /libs\s*:\s*{([\s\S]*?)}/s;
    const libsMatch = libsRegex.exec(content);

    if (!libsMatch) {
      logger.warn("No libraries section found in build.config.ts");
      return;
    }

    // Check if the library exists
    const libRegex = new RegExp(`\\s*"${name}"\\s*:\\s*{[\\s\\S]*?},?`, "g");
    const libExists = libRegex.test(libsMatch[1]!);

    if (!libExists) {
      logger.warn(`Library "${name}" not found in configuration`);
      return;
    }

    // Remove the library
    let newContent = content.replace(libRegex, "");

    // Clean up empty libs section or trailing commas
    newContent = newContent.replace(/libs\s*:\s*{\s*},/s, "libs: {},");
    newContent = newContent.replace(/,(\s*})/g, "$1");

    // Write the updated content back to the file
    await fs.writeFile(BUILD_CONFIG_PATH, newContent, "utf8");
    logger.success(`Removed library "${name}" from configuration`);

    // Clean up the deprecated build.libs.jsonc if it exists
    await cleanupDeprecatedLibsFile();
  } catch (error) {
    logger.error(`Failed to remove library "${name}":`, error);
  }
}

/**
 * Migrates libraries from build.libs.jsonc to build.config.ts
 */
async function migrateFromJsonc(): Promise<void> {
  try {
    const libsFile = path.resolve(ROOT_DIR, "build.libs.jsonc");

    if (!(await fs.pathExists(libsFile))) {
      logger.info("No build.libs.jsonc file found. Nothing to migrate.");
      return;
    }

    logger.info("Migrating libraries from build.libs.jsonc...");

    const content = await fs.readFile(libsFile, "utf8");
    // Remove comments
    const jsonContent = content.replace(/\/\/.*$/gm, "");
    const libs = JSON.parse(jsonContent);

    for (const [name, config] of Object.entries(
      libs as Record<string, unknown>,
    )) {
      const libConfig = config as { main: string };
      await addLibrary(name, libConfig.main);
    }

    logger.success("Migration completed successfully.");

    // Offer to clean up the deprecated file
    await cleanupDeprecatedLibsFile();
  } catch (error) {
    logger.error("Failed to migrate libraries:", error);
  }
}

/**
 * Parse command-line arguments and execute the corresponding action
 */
async function main(): Promise<void> {
  try {
    const [, , action, ...args] = process.argv;

    switch (action) {
      case "list":
        await listLibraries();
        break;

      case "add":
        if (args.length < 2) {
          logger.error(
            "Usage: bun manage-libs.ts add <name> <main> [description]",
          );
          process.exit(1);
        }
        await addLibrary(args[0]!, args[1]!, args[2] || undefined);
        break;

      case "remove":
        if (args.length < 1) {
          logger.error("Usage: bun manage-libs.ts remove <name>");
          process.exit(1);
        }
        await removeLibrary(args[0]!);
        break;

      case "migrate":
        await migrateFromJsonc();
        break;

      case "cleanup":
        await cleanupDeprecatedLibsFile();
        break;

      default:
        console.log(`
Library Management Script

Usage:
  bun manage-libs.ts <command> [args]

Commands:
  list                     List all configured libraries
  add <name> <main> [desc] Add or update a library
  remove <name>            Remove a library
  migrate                  Migrate from build.libs.jsonc
  cleanup                  Remove deprecated build.libs.jsonc file
  help                     Show this help message

Examples:
  bun manage-libs.ts list
  bun manage-libs.ts add @my/lib src/libs/my-lib/main.ts "My library description"
  bun manage-libs.ts remove @my/lib
  bun manage-libs.ts migrate
        `);
        break;
    }
  } catch (error) {
    logger.error("An unexpected error occurred:", error);
    process.exit(1);
  }
}

// Execute when run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { listLibraries, addLibrary, removeLibrary, migrateFromJsonc };
