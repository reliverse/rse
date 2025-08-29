import {
  findCommandDirs,
  generateCommandTemplate,
  generateExports,
  handleReliverseConfig,
} from "@reliverse/dler";
import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "rempts",
    version: "1.0.0",
    description:
      "Scaffold new CLI commands and generate a command exports file (this file allows you to run your commands programmatically).",
  },
  args: defineArgs({
    init: {
      type: "string",
      description: "Names of commands to initialize (space-separated or quoted)",
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite existing commands and exports file",
      default: true,
    },
    customCmdsRoot: {
      type: "string",
      description: "Root directory for custom commands",
    },
    outFile: {
      type: "string",
      description: "Output file path for exports (relative to workspace root)",
      default: "src-ts/app/cmds.ts",
    },
    cmdDirs: {
      type: "array",
      description: "Command directories to scan (relative to src-ts/app)",
    },
  }),
  async run({ args }) {
    let cmdsRoot = args.customCmdsRoot;
    let cliFilePath = "";

    // --- 1. Create commands if requested ---
    let didInit = false;
    if (args.init) {
      let cmdNames: string[] = [];
      if (Array.isArray(args.init)) {
        cmdNames = args.init as string[];
      } else if (typeof args.init === "string") {
        cmdNames = args.init.split(/\s+/).filter(Boolean);
      }
      if (cmdNames.length === 1) {
        const argv = process.argv;
        const initIndex = argv.indexOf("--init");
        if (initIndex !== -1 && initIndex + 1 < argv.length) {
          const additionalArgs: string[] = [];
          for (let i = initIndex + 2; i < argv.length; i++) {
            const arg = argv[i];
            if (arg?.startsWith("--")) break;
            if (arg && !arg.startsWith("-")) {
              additionalArgs.push(arg);
            } else {
              break;
            }
          }
          if (additionalArgs.length > 0 && cmdNames[0]) {
            cmdNames = [cmdNames[0], ...additionalArgs];
          }
        }
      }
      if (cmdNames.length === 0) {
        relinka("error", "No command names provided");
        return;
      }

      if (!cmdsRoot) {
        const defaultCmdsRoot = path.resolve("src-ts/app");
        if (await fs.pathExists(defaultCmdsRoot)) {
          cmdsRoot = defaultCmdsRoot;
        } else {
          const { cmdsRoot: configCmdsRoot, cliFile } = await handleReliverseConfig();
          cmdsRoot = configCmdsRoot;
          cliFilePath = cliFile;
        }
      } else {
        cmdsRoot = path.resolve(cmdsRoot);
      }

      relinka("info", `🚀 Creating ${cmdNames.length} command(s): ${cmdNames.join(", ")}`);

      for (const cmdName of cmdNames) {
        const dirPath = path.join(cmdsRoot, cmdName);
        const filePath = path.join(dirPath, "cmd.ts");
        if ((await fs.pathExists(filePath)) && !args.overwrite) {
          relinka("warn", `Command "${cmdName}" already exists. Use --overwrite to overwrite.`);
          continue;
        }
        await fs.ensureDir(dirPath);
        const content = generateCommandTemplate(cmdName);
        await fs.writeFile(filePath, content, "utf8");
        relinka("verbose", `✅ Created new command: ${filePath}`);
      }

      if (cliFilePath) {
        relinka(
          "info",
          "📦 Make sure you have @reliverse/rempts installed: bun add @reliverse/rempts",
        );
      }

      didInit = true;
    }

    // --- 2. (Re)generate the exports file if requirements are met ---
    // If no args.init, just (re)generate cmds.ts if at least one cmd.{ts,js} exists
    if (!args.init) {
      const root = path.resolve("src-ts/app");
      const outPath = path.resolve(args.outFile ?? "src-ts/app/cmds.ts");

      const cmdDirs =
        (args.cmdDirs ?? []).length > 0 ? (args.cmdDirs ?? []) : await findCommandDirs(root);

      if (cmdDirs.length === 0) {
        relinka(
          "warn",
          "No command directories found with cmd.ts or cmd.js files. Nothing to generate.",
        );
        return;
      }

      if ((await fs.pathExists(outPath)) && !args.overwrite) {
        relinka("warn", `❌ File "${outPath}" already exists. Use --overwrite to overwrite.`);
        return;
      }

      const exports = await generateExports(cmdDirs);
      await fs.ensureDir(path.dirname(outPath));
      await fs.writeFile(outPath, exports, "utf8");
      relinka("success", `✅ Generated command exports at: ${outPath}`);
      relinka("verbose", `Found ${cmdDirs.length} command(s): ${cmdDirs.join(", ")}`);
      return;
    }

    // If we got here, it means --init was used and handled above, and we always (re)generate exports after that
    const root = path.resolve("src-ts/app");
    const outPath = path.resolve(args.outFile ?? "src-ts/app/cmds.ts");

    if ((await fs.pathExists(outPath)) && !args.overwrite) {
      relinka("warn", `❌ File "${outPath}" already exists. Use --overwrite to overwrite.`);
      return;
    }

    const cmdDirs =
      (args.cmdDirs ?? []).length > 0 ? (args.cmdDirs ?? []) : await findCommandDirs(root);

    if (cmdDirs.length === 0) {
      relinka("warn", "No command directories found with cmd.ts or cmd.js files.");
      return;
    }

    const exports = await generateExports(cmdDirs);
    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, exports, "utf8");
    relinka("success", `✅ Generated command exports at: ${outPath}`);
    relinka("verbose", `Found ${cmdDirs.length} command(s): ${cmdDirs.join(", ")}`);

    // print usage example if --init was used
    if (didInit) {
      relinka(
        "log",
        `Usage example:

import { getCmdName } from "~/app/cmds";
const cmd = await getCmdName();
await callCmd(cmd, [
  // String arguments
  "--name=my-project",
  "--path=./src",
  
  // Boolean flags
  "--force",
  "--no-cache",
  
  // Number values
  "--port=3000",
  
  // Array values
  "--files=file1.ts,file2.ts",

  // Positional arguments (must come last)
  "--build=src/1.ts src/2.ts",
]);`,
      );
    }
  },
});
