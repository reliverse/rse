import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import {
  inputPrompt,
  multiselectPrompt,
  confirmPrompt,
} from "@reliverse/rempts";
import { eq } from "drizzle-orm";
import { ofetch } from "ofetch";
import open from "open";
import { getRandomValues } from "uncrypto";

import type { RseConfig } from "~/libs/sdk/cfg/cfg-types";

import { db } from "~/libs/sdk/db/client";
import { encrypt, decrypt } from "~/libs/sdk/db/config";
import { userDataTable } from "~/libs/sdk/db/schema";

import { KNOWN_SERVICES, type KeyType } from "./cef-keys";

interface EnvPaths {
  projectRoot: string;
  exampleEnvPath: string;
  envPath: string;
}

function getEnvPaths(projectPath: string): EnvPaths {
  const projectRoot = path.resolve(projectPath);
  return {
    projectRoot,
    exampleEnvPath: path.join(projectRoot, ".env.example"),
    envPath: path.join(projectRoot, ".env"),
  };
}

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function safeWriteFile(
  filePath: string,
  content: string,
): Promise<boolean> {
  try {
    await fs.writeFile(filePath, content);
    return true;
  } catch {
    return false;
  }
}

export async function ensureExampleExists(
  projectPath: string,
  fallbackEnvExampleURL: string,
): Promise<boolean> {
  const { exampleEnvPath } = getEnvPaths(projectPath);

  try {
    if (await fs.pathExists(exampleEnvPath)) {
      return true;
    }

    relinka("info", "Fetching .env.example file...");
    const content = await fetchEnvExampleContent(fallbackEnvExampleURL);
    if (!content) {
      relinka("error", "Failed to fetch .env.example content.");
      return false;
    }

    if (!(await safeWriteFile(exampleEnvPath, content))) {
      relinka("error", "Failed to write .env.example file.");
      return false;
    }

    relinka("success", ".env.example file fetched and saved.");
    return true;
  } catch {
    relinka("error", "Failed to ensure .env.example exists.");
    return false;
  }
}

export async function ensureEnvExists(projectPath: string): Promise<boolean> {
  const { envPath, exampleEnvPath } = getEnvPaths(projectPath);

  try {
    if (await fs.pathExists(envPath)) {
      return true;
    }

    const exampleContent = await safeReadFile(exampleEnvPath);
    if (!exampleContent) {
      relinka("error", "Failed to read .env.example file.");
      return false;
    }

    if (!(await safeWriteFile(envPath, exampleContent))) {
      relinka("error", "Failed to create .env file.");
      return false;
    }

    relinka(
      "verbose",
      ".env file created from .env.example provided by the template.",
    );
    return true;
  } catch {
    relinka("error", "Failed to ensure .env exists.");
    return false;
  }
}

/**
 * Helper to parse lines from a .env file
 * Returns an object: { KEY: "value", ... }
 */
function parseEnvKeys(envContents: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = envContents
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !!l && !l.startsWith("#"));

  for (const line of lines) {
    // Simplistic parse: KEY=VALUE
    // It handles lines like KEY="VALUE" or KEY='VALUE'
    const [rawKey, ...rest] = line.split("=");
    if (!rawKey) continue;
    const key = rawKey.trim();
    // Rejoin with "=" in case the value has "=" inside
    let rawValue = rest.join("=");
    // Remove possible wrapping quotes
    rawValue = rawValue.replace(/^["']|["']$/g, "");
    result[key] = rawValue;
  }
  return result;
}

/**
 * Revised getMissingKeys:
 * 1) Reads all required keys from .env.example
 * 2) Parses .env to see which keys are present & non-empty
 * 3) Returns only those that are truly missing or empty
 */
export async function getMissingKeys(projectPath: string): Promise<string[]> {
  const { envPath, exampleEnvPath } = getEnvPaths(projectPath);

  try {
    const envContent = await safeReadFile(envPath);
    if (!envContent) {
      relinka("error", "Failed to read .env file.");
      return [];
    }
    const exampleContent = await safeReadFile(exampleEnvPath);
    if (!exampleContent) {
      relinka("error", "Failed to read .env.example file.");
      return [];
    }

    // 1) All required keys
    const requiredKeys = await getRequiredKeys(exampleEnvPath);

    // 2) Parse .env
    const existingEnvKeys = parseEnvKeys(envContent);

    // 3) Which required keys are not found or have empty value
    const missing = requiredKeys.filter((key) => {
      const val = existingEnvKeys[key];
      // If the key isn't present or is empty string, treat it as missing
      return !val;
    });

    return missing;
  } catch {
    relinka("error", "Failed to get missing keys.");
    return [];
  }
}

async function getRequiredKeys(exampleEnvPath: string): Promise<string[]> {
  const content = await safeReadFile(exampleEnvPath);
  if (!content) return [];

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line): line is string => !!line && !line.startsWith("#"))
    .map((line) => line.split("=")[0])
    .filter((key): key is string => !!key)
    .map((key) => key.trim());
}

export async function copyFromExisting(
  projectPath: string,
  sourcePath: string,
): Promise<boolean> {
  const { envPath } = getEnvPaths(projectPath);

  try {
    let fullEnvPath = sourcePath;
    const stats = await fs.stat(sourcePath).catch(() => null);

    if (stats?.isDirectory()) {
      fullEnvPath = path.join(sourcePath, ".env");
    }

    if (!(await fs.pathExists(fullEnvPath))) {
      relinka("error", `Could not find .env file at ${fullEnvPath}`);
      return false;
    }

    await fs.copy(fullEnvPath, envPath);
    relinka("verbose", "Existing .env file has been copied successfully!");
    return true;
  } catch {
    relinka("error", "Failed to copy existing .env file.");
    return false;
  }
}

export function getEnvPath(projectPath: string): string {
  return getEnvPaths(projectPath).envPath;
}

export async function fetchEnvExampleContent(
  urlResource: string,
): Promise<string | null> {
  try {
    const response = await ofetch<Response>(urlResource);
    if (!response.ok) {
      throw new Error(`Failed to fetch .env.example from ${urlResource}`);
    }
    const text = await response.text();
    return typeof text === "string" ? text : null;
  } catch (error) {
    relinka(
      "error",
      `Error fetching .env.example: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

const LAST_ENV_FILE_KEY = "last_env_file";

async function updateEnvValue(
  envPath: string,
  key: string,
  value: string,
): Promise<void> {
  const envContent = await fs.readFile(envPath, "utf8");
  const envLines = envContent.split("\n");
  const newLine = `${key}="${value}"`;

  const lineIndex = envLines.findIndex((line) => {
    const [existingKey] = line.split("=");
    return existingKey?.trim() === key;
  });

  if (lineIndex !== -1) {
    envLines[lineIndex] = newLine;
  } else {
    envLines.push(newLine);
  }

  await fs.writeFile(envPath, `${envLines.join("\n").trim()}\n`);
}

/**
 * Validate user-provided values based on key type.
 * Returns true if the value passes, otherwise returns an error message.
 */
function validateKeyValue(value: string, keyType: KeyType): string | boolean {
  const trimmed = value.trim();

  switch (keyType) {
    case "string":
    case "password":
    case "database":
      return true;
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmed)
        ? true
        : "Please enter a valid email address.";
    }
    case "boolean": {
      // Accept "true" or "false" (case-insensitive)
      const lower = trimmed.toLowerCase();
      if (lower === "true" || lower === "false") return true;
      return 'Please enter "true" or "false".';
    }
    case "number": {
      // Check if numeric
      return isNaN(Number(trimmed)) ? "Please enter a valid number." : true;
    }
    default:
      return true;
  }
}

/**
 * Generates a cryptographically secure random string of specified length
 * @param length - The length of the string to generate (default: 64)
 * @returns A secure random string in hexadecimal format
 */
function generateSecureString(length = 64): string {
  // Create a Uint8Array with half the length (since each byte becomes 2 hex chars)
  const randomBytesArray = new Uint8Array(Math.ceil(length / 2));

  // Fill the array with random values
  getRandomValues(randomBytesArray);

  // Convert to hex string and trim to the requested length
  return Array.from(randomBytesArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

export async function promptAndSetMissingValues(
  missingKeys: string[],
  envPath: string,
  maskInput: boolean,
  config: RseConfig,
  wasEnvCopied = false,
  isMrse = false,
  projectPath = "",
  skipPrompts = false,
): Promise<void> {
  if (missingKeys.length === 0 || wasEnvCopied) {
    relinka(
      "verbose",
      wasEnvCopied
        ? "Using values from copied .env file"
        : "No missing keys to process.",
    );
    return;
  }

  relinka("verbose", `Processing missing values: ${missingKeys.join(", ")}`);

  // Check for mrse project env file
  let mrseEnvPath: string | null = null;
  let projectName = "";

  if (isMrse && projectPath) {
    // Extract project name from the path
    projectName = path.basename(projectPath);
    // Construct the path to the mrse env file
    mrseEnvPath = path.join(
      projectPath,
      ".config",
      "mrse",
      `${projectName}.env`,
    );

    // Check if the mrse env file exists
    const mrseEnvExists = await fs.pathExists(mrseEnvPath).catch(() => false);

    // If skipPrompts is true and the mrse env file exists, use it automatically
    if (skipPrompts && mrseEnvExists) {
      relinka(
        "info",
        `Using environment variables from .config/mrse/${projectName}.env`,
      );
      if (await copyFromExisting(projectPath, mrseEnvPath)) {
        relinka(
          "success",
          "Environment variables copied from mrse environment file.",
        );
        const remainingMissingKeys = await getMissingKeys(projectPath);
        if (remainingMissingKeys.length > 0) {
          relinka(
            "info",
            `The following keys are still missing in the copied .env file: ${remainingMissingKeys.join(", ")}`,
          );
          // Continue with the normal flow for remaining keys
          await promptAndSetMissingValues(
            remainingMissingKeys,
            envPath,
            maskInput,
            config,
            true,
            isMrse,
            projectPath,
            skipPrompts,
          );
        }
        return;
      }
    }
  }

  // Group missing keys by service
  const servicesWithMissingKeys = Object.entries(KNOWN_SERVICES).filter(
    ([, service]) => service.keys.some((k) => missingKeys.includes(k.key)),
  );

  const selectedServicesMsg = config.envComposerOpenBrowser
    ? "✨ I'll open the service dashboards for you. Remember to come back to the terminal after accessing them!"
    : "✨ I'll show you the dashboard links for your selected services. You can open them in your browser (use Ctrl+Click if your terminal supports it).";

  // Filter only the services that actually have keys that are missing.
  const validServices = servicesWithMissingKeys.map(([key, service]) => ({
    label: service.name,
    value: key,
  }));

  // If for some reason no services matched, just skip
  if (validServices.length === 0) {
    relinka(
      "verbose",
      "No known services require missing keys. Possibly custom keys missing?",
    );
    return;
  }

  // Prepare options for the multiselectPrompt
  let options = validServices;

  // Add the special mrse option if applicable
  if (isMrse && mrseEnvPath && (await fs.pathExists(mrseEnvPath))) {
    options = [
      {
        label: `Get keys from .config/mrse/${projectName}.env`,
        value: "mrse_env",
      },
      ...validServices,
    ];
  }

  const selectedServices = await multiselectPrompt({
    title: "Great! Which services do you want to configure?",
    content: selectedServicesMsg,
    defaultValue: options.map((srv) => srv.value),
    options: options,
  });

  // Handle the special mrse option if selected
  if (selectedServices.includes("mrse_env") && mrseEnvPath) {
    relinka(
      "info",
      `Using environment variables from .config/mrse/${projectName}.env`,
    );
    if (await copyFromExisting(projectPath, mrseEnvPath)) {
      relinka(
        "success",
        "Environment variables copied from mrse environment file.",
      );
      const remainingMissingKeys = await getMissingKeys(projectPath);
      if (remainingMissingKeys.length > 0) {
        relinka(
          "info",
          `The following keys are still missing in the copied .env file: ${remainingMissingKeys.join(", ")}`,
        );
        // Continue with the normal flow for remaining keys, but remove the mrse option
        const filteredServices = selectedServices.filter(
          (s) => s !== "mrse_env",
        );
        if (filteredServices.length > 0) {
          // Process the remaining services
          for (const serviceKey of filteredServices) {
            await processService(
              serviceKey,
              missingKeys,
              envPath,
              maskInput,
              config,
            );
          }
        }
      }
      return;
    }
  }

  // Process the selected services
  for (const serviceKey of selectedServices) {
    if (serviceKey === "skip" || serviceKey === "mrse_env") continue;
    await processService(serviceKey, missingKeys, envPath, maskInput, config);
  }
}

// Helper function to process a service
async function processService(
  serviceKey: string,
  missingKeys: string[],
  envPath: string,
  maskInput: boolean,
  config: RseConfig,
): Promise<void> {
  const service = KNOWN_SERVICES[serviceKey];
  if (!service) return;

  if (service.dashboardUrl && service.dashboardUrl !== "none") {
    relinka("verbose", `Opening ${service.name} dashboard...`);
    if (config.envComposerOpenBrowser) {
      await open(service.dashboardUrl);
    } else {
      relinka("info", `Dashboard link: ${service.dashboardUrl}`);
    }
  }

  for (const keyConfig of service.keys) {
    // If it's not in the missing list, skip
    if (!missingKeys.includes(keyConfig.key)) {
      continue;
    }

    // If optional is true, give user a chance to skip
    if (keyConfig.optional) {
      const displayValue =
        maskInput && keyConfig.defaultValue
          ? "[hidden]"
          : keyConfig.defaultValue === "generate-64-chars"
            ? "[will generate secure string]"
            : keyConfig.defaultValue
              ? `"${keyConfig.defaultValue}"`
              : "";

      const shouldFill = await confirmPrompt({
        title: `Do you want to configure ${keyConfig.key}?${
          displayValue ? ` (default: ${displayValue})` : ""
        }`,
        defaultValue: false,
      });
      if (!shouldFill) {
        if (keyConfig.defaultValue) {
          const value =
            keyConfig.defaultValue === "generate-64-chars"
              ? generateSecureString()
              : keyConfig.defaultValue;
          await updateEnvValue(envPath, keyConfig.key, value);
          relinka(
            "verbose",
            `Using ${
              keyConfig.defaultValue === "generate-64-chars"
                ? "generated"
                : "default"
            } value for ${keyConfig.key}${maskInput ? "" : `: ${value}`}`,
          );
        }
        continue;
      }
    }

    let isValid = false;
    let userInput = "";

    while (!isValid) {
      const defaultVal =
        keyConfig.defaultValue === "generate-64-chars"
          ? generateSecureString()
          : keyConfig.defaultValue;

      userInput = await inputPrompt({
        title: `Enter value for ${keyConfig.key}:`,
        placeholder: defaultVal
          ? `Press Enter to use default: ${maskInput ? "[hidden]" : defaultVal}`
          : "Paste your value here...",
        defaultValue: defaultVal ?? "",
        mode: maskInput ? "password" : "plain",
        ...(keyConfig.instruction && {
          content: keyConfig.instruction,
          contentColor: "yellowBright",
        }),
        ...(service.dashboardUrl &&
          service.dashboardUrl !== "none" && {
            hint: `Visit ${service.dashboardUrl} to get your key`,
          }),
      });

      // If user just pressed Enter, use default
      if (!userInput.trim() && keyConfig.defaultValue) {
        userInput = keyConfig.defaultValue;
      }

      const validationResult = validateKeyValue(userInput, keyConfig.type);
      if (validationResult === true) {
        isValid = true;
      } else {
        relinka("warn", validationResult as string);
      }
    }

    const rawValue = userInput.startsWith(`${keyConfig.key}=`)
      ? userInput.substring(userInput.indexOf("=") + 1)
      : userInput;
    const cleanValue = rawValue.trim().replace(/^['"](.*)['"]$/, "$1");

    await updateEnvValue(envPath, keyConfig.key, cleanValue);
  }
}

export async function saveLastEnvFilePath(envPath: string): Promise<void> {
  try {
    const encryptedPath = await encrypt(envPath);
    await db
      .insert(userDataTable)
      .values({
        key: LAST_ENV_FILE_KEY,
        value: encryptedPath,
      })
      .onConflictDoUpdate({
        target: userDataTable.key,
        set: { value: encryptedPath },
      });
    relinka(
      "success",
      "Environment file path saved securely. You can use it later.",
    );
  } catch (error) {
    relinka(
      "error",
      "Failed to save env file path:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function getLastEnvFilePath(): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(userDataTable)
      .where(eq(userDataTable.key, LAST_ENV_FILE_KEY))
      .get();

    if (result?.value) {
      return await decrypt(result.value);
    }
    return null;
  } catch (error) {
    relinka(
      "error",
      "Failed to get last env file path:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
