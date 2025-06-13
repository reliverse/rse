// [isDev example]:
// - `bun dev:mrse`
// - `bun dev:mrse --ts`
// - `bun dev:mrse --jsonc project1 project2 project3`

import { generateRseConfig } from "@reliverse/cfg";
import path from "@reliverse/pathkit";
import { ensuredir } from "@reliverse/relifso";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";
import { parseJSONC } from "confbox";
import { execaCommand } from "execa";
import { jsonrepair } from "jsonrepair";
import { loadFile, writeFile, builders } from "magicast";

import { UNKNOWN_VALUE } from "~/libs/sdk/constants";
import {
  downloadFileFromGitHub,
  ensureEnvCacheDir,
  getEnvCacheDir,
  getEnvCachePath,
  logVerbose,
  type GenCfg,
  type GenCfgJsonc,
} from "~/libs/sdk/mrse/mrse-impl";

/**
 * Generates rse config files for multiple projects
 */
export default defineCommand({
  meta: {
    name: "mrse",
    description: "Generate rse config files for multiple projects",
    hidden: true,
  },
  args: {
    ts: {
      type: "boolean",
      description: "Generate TypeScript config files (default is JSONC)",
      default: false,
    },
    dev: {
      type: "boolean",
      description: "Generate configs in development mode",
      default: false,
    },
    jsonc: {
      type: "boolean",
      description: "Generate JSONC config files (default)",
      default: true,
    },
    nocache: {
      type: "boolean",
      description: "Disable caching of downloaded .env.example files",
      default: false,
    },
    fresh: {
      type: "boolean",
      description:
        "Redownload all cached .env.example files, ignoring existing cache",
      default: false,
    },
    typesPath: {
      type: "string",
      description: "Custom path to type definitions for TypeScript configs",
      default: "../src/libs/sdk/sdk-mod",
    },
    _: {
      type: "array",
      description: "Names of projects to generate configs for",
      required: false,
    },
  },
  run: async ({ args }) => {
    // Determine whether we use JSONC or TS
    const useJsonc = !args.ts;
    // Projects specified from CLI
    const projectNames = args._ || [];
    // If user explicitly passed --dev, that overrides environment checks
    const devFlag = args.dev === true;
    // Final determination whether we're in dev mode
    const isDev = devFlag || process.env.NODE_ENV === "development";

    // Check whether we should use cache or not
    const cacheFlag = !args.nocache;
    // Check if we're redownloading env files
    const freshFlag = args.fresh === true;

    // Quick logs
    logVerbose("Parsed arguments:", args);
    logVerbose("Project names:", projectNames);
    logVerbose("Format:", useJsonc ? "JSONC" : "TypeScript");
    logVerbose("Dev mode:", isDev);
    logVerbose("Using cache:", cacheFlag);
    logVerbose("Fresh mode:", freshFlag);

    // If fresh mode is enabled, let user know
    if (freshFlag) {
      relinka(
        "info",
        "Fresh mode enabled: Will redownload all cached .env.example files",
      );
    }

    // Get current working directory
    const cwd = process.cwd();

    // Create 'mrse' folder if it doesn't exist
    const mrseFolderPath = path.join(cwd, ".config", "mrse");
    await ensuredir(mrseFolderPath);

    // Check for and generate mrse file if it doesn't exist
    const mrseFileName = useJsonc ? "mrse.jsonc" : "mrse.ts";
    const mrsePath = path.join(cwd, ".config", mrseFileName);
    const mrseExists = await fs.pathExists(mrsePath);

    // Check if the other format already exists to prevent conflicts
    const oppositeFormatFileName = useJsonc ? "mrse.ts" : "mrse.jsonc";
    const oppositeFormatPath = path.join(
      cwd,
      ".config",
      oppositeFormatFileName,
    );
    const oppositeFormatExists = await fs.pathExists(oppositeFormatPath);

    // Throw error if trying to generate one format when the other exists
    if (!mrseExists && oppositeFormatExists) {
      relinka(
        "error",
        `Cannot generate ${mrseFileName} when ${oppositeFormatFileName} already exists. ` +
          `Please delete ${oppositeFormatFileName} first or use the appropriate format flag.`,
      );
      // Exit process gracefully without showing stack trace
      process.exit(1);
    }

    let genCfgData: GenCfg[] = [];

    // Check for mixed configuration formats in the directory
    const existingFiles = await fs.readdir(mrseFolderPath);
    const hasJsoncFiles = existingFiles.some(
      (file) => file.endsWith(".jsonc") && file !== "mrse.jsonc",
    );
    const hasTsFiles = existingFiles.some(
      (file) => file.endsWith(".ts") && file !== "mrse.ts",
    );

    // Don't allow mixing of TS and JSONC project files
    if ((useJsonc && hasTsFiles) || (!useJsonc && hasJsoncFiles)) {
      const currentFormat = useJsonc ? "JSONC" : "TypeScript";
      const existingFormat = useJsonc ? "TypeScript" : "JSONC";
      relinka(
        "error",
        `Cannot generate ${currentFormat} files when ${existingFormat} files already exist in the mrse folder. ` +
          `Please use --${useJsonc ? "ts" : "jsonc"} flag to match your existing configuration format.`,
      );
      // Exit process gracefully without showing stack trace
      process.exit(1);
    }

    if (!mrseExists) {
      relinka("info", `Generating ${mrseFileName} file...`);

      // Create content for the mrse file
      let mrseContent = "";
      if (useJsonc) {
        // JSONC format
        mrseContent = `{
  // @reliverse/rse mrse mode
  // 👉 ${isDev ? "`bun dev:mrse`" : "`rse mrse`"}
  "genCfg": [
    {
      "projectName": "project1",
      "projectTemplate": "blefnk/relivator-nextjs-template",
      "getEnvExample": true
    },
    {
      "projectName": "project2",
      "projectTemplate": "blefnk/relivator-nextjs-template",
      "getEnvExample": true
    },
    {
      "projectName": "project3",
      "projectTemplate": "blefnk/relivator-nextjs-template",
      "getEnvExample": true
    }
  ]
}`;
      } else {
        // TypeScript format
        mrseContent = `// @reliverse/rse mrse mode
// 👉 ${isDev ? "`bun dev:mrse`" : "`rse mrse`"}

type GenCfg = {
  projectName: string;
  projectTemplate: string;
  getEnvExample: boolean;
  projectPath?: string;
};

export const genCfg: GenCfg[] = [
  {
    projectName: "project1",
    projectTemplate: "blefnk/relivator-nextjs-template",
    getEnvExample: true,
  },
  {
    projectName: "project2",
    projectTemplate: "blefnk/relivator-nextjs-template",
    getEnvExample: true,
  },
  {
    projectName: "project3",
    projectTemplate: "blefnk/relivator-nextjs-template",
    getEnvExample: true,
  },
];
`;
      }

      // Write the mrse file
      if (useJsonc) {
        await fs.writeFile(mrsePath, mrseContent);
      } else {
        // For TypeScript files, try magicast for safer formatting
        try {
          const mod = builders.raw(mrseContent);
          await writeFile(mod, mrsePath);
        } catch {
          // Fallback to direct write
          await fs.writeFile(mrsePath, mrseContent);
        }
      }

      relinka("success", `Generated ${mrseFileName} in .config folder`);

      // Default data for new file
      genCfgData = [
        {
          projectName: "project1",
          projectTemplate: "blefnk/relivator-nextjs-template",
          getEnvExample: true,
        },
        {
          projectName: "project2",
          projectTemplate: "blefnk/relivator-nextjs-template",
          getEnvExample: true,
        },
        {
          projectName: "project3",
          projectTemplate: "blefnk/relivator-nextjs-template",
          getEnvExample: true,
        },
      ];

      // If no project names were specified, exit after creating the mrse file
      if (projectNames.length === 0) {
        relinka(
          "info",
          "No project names specified. Only generated the config file.",
        );
        return;
      }
    } else {
      relinka("info", `Using existing ${mrseFileName} file`);

      try {
        // Read and parse mrse file
        if (useJsonc) {
          const fileContent = await fs.readFile(mrsePath, "utf-8");
          try {
            // Parse JSONC
            const parsedData = parseJSONC(fileContent) as GenCfgJsonc;
            genCfgData = parsedData.genCfg || [];
          } catch (parseError) {
            // Attempt to repair the JSON
            relinka(
              "warn",
              `JSONC parsing failed, attempting to repair the file: ${
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError)
              }`,
            );

            try {
              // Remove comments before running jsonrepair
              const commentStrippedContent = fileContent
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");

              // Repair JSON
              const repairedJson = jsonrepair(commentStrippedContent);
              const parsedData = JSON.parse(repairedJson) as GenCfgJsonc;
              genCfgData = parsedData.genCfg || [];

              relinka("success", "JSON repaired successfully");
            } catch (repairError) {
              relinka(
                "error",
                `Failed to repair JSON: ${
                  repairError instanceof Error
                    ? repairError.message
                    : String(repairError)
                }`,
              );
              throw new Error(
                "Unable to parse or repair the JSON configuration file",
              );
            }
          }
        } else {
          // TypeScript - use magicast
          try {
            const mod = await loadFile(mrsePath);
            if (mod.exports && mod.exports.genCfg) {
              // Convert the result to a plain object
              genCfgData = JSON.parse(
                JSON.stringify(mod.exports.genCfg),
              ) as GenCfg[];
            } else {
              relinka(
                "warn",
                "The mrse.ts file does not export a 'genCfg' array",
              );
              genCfgData = [];
            }
          } catch (error) {
            relinka(
              "error",
              `Error loading TypeScript file: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            genCfgData = [];
          }
        }

        logVerbose("Loaded mrse data:", genCfgData);
      } catch (error) {
        relinka(
          "error",
          `Error parsing ${mrseFileName}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        relinka("warn", "Continuing with empty configuration");
        genCfgData = [];
      }
    }

    // Determine which projects to process
    let projectsToProcess: string[] = [];

    if (projectNames.length > 0) {
      // Filter only projects present in gen.cfg if there's a match
      const matchingProjects = projectNames.filter((name) =>
        genCfgData.some((cfg) => cfg.projectName === name),
      );

      if (matchingProjects.length > 0) {
        projectsToProcess = matchingProjects;
        relinka(
          "info",
          `Found ${matchingProjects.length} matching projects in ${mrseFileName}`,
        );
      } else {
        // If no matching config, process the user-specified projects anyway
        projectsToProcess = projectNames;
      }
    } else if (mrseExists) {
      // If no projects specified but gen.cfg exists, process all from gen.cfg
      projectsToProcess = genCfgData.map((cfg) => cfg.projectName);
      relinka(
        "info",
        `Processing all ${projectsToProcess.length} projects from ${mrseFileName}`,
      );
    }

    // If no projects remain to process, exit
    if (projectsToProcess.length === 0) {
      relinka(
        "info",
        "No projects to process. Either specify project names or populate the gen.cfg file.",
      );
      return;
    }

    // Ensure env cache directory exists if needed
    if (
      cacheFlag &&
      genCfgData.some((cfg) => cfg.getEnvExample && cfg.projectTemplate)
    ) {
      await ensureEnvCacheDir();
      logVerbose(`Env cache directory: ${getEnvCacheDir()}`);
    }

    // Track operation counts
    let generatedCount = 0;
    let envFilesDownloaded = 0;
    let envFilesFromCache = 0;
    let envFilesRefreshed = 0;

    // Generate config for each project
    for (const projectName of projectsToProcess) {
      relinka("verbose", `Generating config for project: ${projectName}`);

      try {
        // Find matching project configuration
        const projectConfig = genCfgData.find(
          (cfg) => cfg.projectName === projectName,
        );
        logVerbose(`Found config for ${projectName}:`, projectConfig);

        // Check if we need to retrieve .env.example
        if (projectConfig?.getEnvExample && projectConfig?.projectTemplate) {
          const cachePath = getEnvCachePath(projectConfig.projectTemplate);
          const cacheExists = cacheFlag && (await fs.pathExists(cachePath));

          if (cacheExists && !freshFlag) {
            relinka(
              "info",
              `Using cached .env.example for ${projectName} from ${projectConfig.projectTemplate}`,
            );
            // Copy cached env file
            const envFilePath = path.join(mrseFolderPath, `${projectName}.env`);
            await fs.copy(cachePath, envFilePath);
            relinka("success", `Created ${projectName}.env from cache`);
            envFilesFromCache++;
          } else {
            // Possibly refreshing or first-time download
            const isRefreshing = freshFlag && cacheExists;

            if (isRefreshing) {
              relinka(
                "info",
                `Refreshing .env.example for ${projectName} from ${projectConfig.projectTemplate}`,
              );
            } else {
              relinka(
                "info",
                `Downloading .env.example for ${projectName} from ${projectConfig.projectTemplate}`,
              );
            }

            const envContent = await downloadFileFromGitHub(
              projectConfig.projectTemplate,
              ".env.example",
              "main",
              cacheFlag,
              freshFlag,
            );

            if (envContent) {
              const envFilePath = path.join(
                mrseFolderPath,
                `${projectName}.env`,
              );
              await fs.writeFile(envFilePath, envContent);

              if (isRefreshing) {
                relinka("success", `Refreshed and saved ${projectName}.env`);
                envFilesRefreshed++;
              } else {
                relinka("success", `Downloaded and saved ${projectName}.env`);
                envFilesDownloaded++;
              }
            } else {
              relinka(
                "warn",
                `Could not download .env.example for ${projectName}`,
              );
            }
          }
        }

        // Construct final config filename
        const configFileName = useJsonc
          ? `${projectName}.jsonc`
          : `${projectName}.ts`;
        const configPath = path.join(mrseFolderPath, configFileName);

        // Check if config file already exists
        const fileExists = await fs.pathExists(configPath);
        logVerbose(`File ${configPath} already exists: ${fileExists}`);

        // Skip if it already exists
        if (fileExists) {
          relinka(
            "warn",
            `Skipping ${projectName} - file already exists: ${configFileName}`,
          );
          continue;
        }

        // Some defaults
        const githubUsername = UNKNOWN_VALUE;
        // For TS configs in dev mode, skip any installation prompts
        const skipInstallPrompt = !useJsonc && isDev;

        // Custom path to the types
        let customTypeImportPath: string | undefined;
        if (!useJsonc && isDev) {
          // Use the value from typesPath flag if provided
          customTypeImportPath = args.typesPath;
        }

        logVerbose("Using custom type import path:", customTypeImportPath);

        // Generate the actual config file
        await generateRseConfig({
          projectName,
          frontendUsername: UNKNOWN_VALUE,
          deployService: "vercel",
          primaryDomain: `https://${projectName}.vercel.app`,
          projectPath: projectConfig?.projectPath || cwd,
          githubUsername,
          isDev,
          customOutputPath: mrseFolderPath,
          customFilename: configFileName,
          skipInstallPrompt,
          ...(customTypeImportPath
            ? { customPathToTypes: customTypeImportPath }
            : {}),
          // Override project config fields
          ...(projectConfig?.projectTemplate
            ? { projectTemplate: projectConfig.projectTemplate }
            : {}),
          overrides: {},
        });

        relinka(
          "success",
          `Generated ${configFileName} in .config/mrse folder`,
        );
        generatedCount++;
      } catch (error) {
        relinka(
          "error",
          `Failed to generate config for ${projectName}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // Summaries
    if (
      generatedCount > 0 ||
      envFilesDownloaded > 0 ||
      envFilesFromCache > 0 ||
      envFilesRefreshed > 0
    ) {
      if (generatedCount > 0) {
        relinka(
          "success",
          `Generated ${generatedCount} configs in the .config/mrse folder.`,
        );
      }
      if (envFilesDownloaded > 0) {
        relinka(
          "success",
          `Downloaded ${envFilesDownloaded} .env files from templates.`,
        );
      }
      if (envFilesFromCache > 0) {
        relinka("success", `Used ${envFilesFromCache} .env files from cache.`);
      }
      if (envFilesRefreshed > 0) {
        relinka(
          "success",
          `Refreshed ${envFilesRefreshed} .env files from templates.`,
        );
      }
    } else {
      relinka("info", "No new files were generated.");
    }

    // For dev environment, copy schema.json and run biome check
    if (isDev) {
      await fs.copy(
        path.join(cwd, "schema.json"),
        path.join(mrseFolderPath, "schema.json"),
      );
      await execaCommand("bunx biome check --write .", {
        cwd: mrseFolderPath,
        stdio: "inherit",
      });
    }
  },
});
