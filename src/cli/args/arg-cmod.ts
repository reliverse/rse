// `reliverse cmod` runs selected codemods

import { defineCommand } from "@reliverse/prompts";
import chalk from "chalk";
import { prompt } from "enquirer";

import { runCodemods } from "~/libs/sdk/cmod/cmod-impl.js";

/**
 * A small sample set of codemods we currently show the user in interactive mode.
 * TODO: fetch codemods using `codemod search`.
 */
const sampleCodemods = [
  "use-react-router-v6",
  "migrate-to-nextjs-14",
  "class-to-functional",
  "js-to-ts",
  "react/19/migration-recipe",
];

export default defineCommand({
  meta: {
    name: "cmod",
    description: "Run codemods via the codemod CLI",
  },
  args: {
    // List of codemod names, if user wants to directly apply them
    codemods: {
      type: "positional",
      required: false,
      array: true,
      description: "Names of codemods to run (e.g. react/19/migration-recipe)",
    },
    dry: {
      type: "boolean",
      description: "Perform a dry run without applying changes",
      default: false,
      required: false,
    },
    format: {
      type: "boolean",
      description: "Enable biome formatting after codemod runs",
      default: false,
      required: false,
    },
    include: {
      type: "string",
      description: "Glob pattern for files to include",
      required: false,
    },
    exclude: {
      type: "string",
      description: "Glob pattern for files to exclude",
      required: false,
    },
  },
  run: async ({ args }) => {
    const { codemods, dry, format, include, exclude } = args;

    // 1. If user provided codemods directly, apply them immediately:
    if (codemods && codemods.length > 0) {
      return await runCodemods([codemods], { dry, format, include, exclude });
    }

    // 2. Otherwise, go into interactive mode
    console.log(chalk.green("\n◆ Reliverse Codemod Selection\n"));

    const { chosen } = await prompt<{ chosen: string[] }>({
      type: "multiselect",
      name: "chosen",
      message: "Select one or more codemods to run:",
      choices: sampleCodemods.map((cm) => ({ name: cm })),
    });

    if (!chosen || chosen.length === 0) {
      console.log(chalk.yellow("No codemods selected. Exiting..."));
      return;
    }

    await runCodemods(chosen, { dry, format, include, exclude });
  },
});
