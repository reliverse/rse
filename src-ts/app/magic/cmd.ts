import { applyMagicSpells, formatError } from "@reliverse/dler";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "magic",
    version: "1.0.0",
    description: "Apply magic directives to files",
  },
  args: defineArgs({
    targets: {
      type: "array",
      description:
        "Targets to process. Can be: 1) Distribution targets: dist-npm, dist-jsr, dist-libs, dist-libs/<lib>; 2) Custom targets: any directory name that is not dist-*",
      required: true,
    },
    lib: {
      type: "string",
      description: "Library name to process (e.g., sdk, cfg). Only valid with dist-libs target.",
    },
    concurrency: {
      type: "number",
      description: "Number of files to process in parallel (default: 4)",
      default: 4,
    },
    batchSize: {
      type: "number",
      description: "Number of files to process in each batch (default: 100)",
      default: 100,
    },
    stopOnError: {
      type: "boolean",
      description: "Stop processing on first error (default: true)",
      default: true,
    },
    about: {
      type: "boolean",
      description: "Show about message",
    },
  }),

  async run({ args }) {
    const { targets, lib, concurrency, batchSize, stopOnError, about } = args;

    if (about) {
      console.log(
        `Apply magic directives to files.
--------------------------------

Target Types:
1. Distribution Targets (dist-*):
   - dist-npm: Process files in dist-npm/bin
   - dist-jsr: Process files in dist-jsr/bin
   - dist-libs: Process all libraries in dist-libs
   - dist-libs/<lib>: Process specific library (e.g., dist-libs/sdk)
   
   For dist-* targets, magic directives are first searched in src/ directory,
   then applied to corresponding files in the distribution directories.

2. Custom Targets:
   - Any directory name that is not dist-* (e.g., "my-output", "custom-build")
   
   For custom targets, magic directives are processed directly in the target files.
   No source directory scanning is performed.

Examples:
  # Process all distribution targets
  dler magic dist-npm dist-jsr dist-libs

  # Process specific library
  dler magic dist-libs/sdk

  # Process custom target
  dler magic my-custom-output

  # Mix distribution and custom targets
  dler magic dist-npm my-custom-output
  
  --------------------------------------------
  For more information, see README.md#15-magic`,
      );
      return;
    }

    // Validate lib parameter
    if (lib) {
      if (!targets?.includes("dist-libs")) {
        throw new Error(
          "The 'lib' parameter can only be used with 'dist-libs' target. Example: dler magic dist-libs/sdk",
        );
      }
      if (targets.some((t: string) => t.startsWith("dist-libs/") && t !== `dist-libs/${lib}`)) {
        throw new Error(
          "Cannot specify both 'lib' parameter and dist-libs/<lib> in targets. Use one or the other.",
        );
      }
    }

    try {
      // Process targets
      const finalTargets =
        targets?.map((target: string) =>
          target === "dist-libs" && lib ? `${target}/${lib}` : target,
        ) ?? [];

      // Log what we're going to do
      const distTargets = finalTargets.filter((t: string) => t.startsWith("dist-"));
      const customTargets = finalTargets.filter((t: string) => !t.startsWith("dist-"));

      if (distTargets.length > 0) {
        console.log("\nProcessing distribution targets:");
        for (const target of distTargets) {
          console.log(`  - ${target} (will scan src/ for magic directives)`);
        }
      }

      if (customTargets.length > 0) {
        console.log("\nProcessing custom targets:");
        for (const target of customTargets) {
          console.log(`  - ${target} (will process magic directives directly in target files)`);
        }
      }

      // Apply magic spells
      await applyMagicSpells(finalTargets, {
        concurrency,
        batchSize,
        stopOnError,
      });

      console.log("\n✨ Magic spells applied successfully!");
    } catch (error) {
      throw new Error(`❌ Processing failed: ${formatError(error)}`);
    }
  },
});

// todo: migrate to new applyMagicSpells implementation (current status: see cmd.ts)

/* import { defineArgs, defineCommand } from "@reliverse/rempts";

import type { SpellType } from "~/app/spell/spell-types";

import { spells } from "~/app/spell/spell-mod";

export default defineCommand({
  meta: {
    name: "spells",
    version: "1.0.0",
    description: "Execute magic spells in your codebase",
  },
  args: defineArgs({
    spells: {
      type: "string",
      description: "Comma-separated list of spells to execute (or 'all')",
      default: "all",
    },
    files: {
      type: "string",
      description: "Comma-separated list of files to process (or all if not specified)",
    },
    dryRun: {
      type: "boolean",
      description: "Preview changes without applying them",
    },
  }),
  async run({ args }) {
    const requestedSpells = args.spells
      ? (args.spells.split(",") as (SpellType | "all")[])
      : ["all"];

    const files = args.files ? args.files.split(",") : [];

    console.log(`Triggering spells: ${requestedSpells.join(", ")}`);
    if (files.length) {
      console.log(`On files: ${files.join(", ")}`);
    } else {
      console.log("On all files");
    }

    if (args.dryRun) {
      console.log("DRY RUN - No changes will be applied");
    }
    const results = await spells({
      spells: requestedSpells as (SpellType | "all")[],
      files,
      dryRun: args.dryRun,
    });

    console.log("\nResults:");
    for (const result of results) {
      const status = result.success ? "✓" : "✗";
      console.log(`${status} ${result.file}: ${result.spell.type} - ${result.message}`);
    }
  },
}); */

/*
**usage examples:**

- `export * from "../../types"; // dler-replace-line` — injects file contents at this line (hooked=true by default)
- `// @ts-expect-error dler-remove-comment` — removes just this comment (hooked=true by default)
- `// dler-remove-line` — removes this line (hooked=true by default)
- `// dler-remove-file` — deletes this file (hooked=true by default)
- `// dler-rename-file-"tsconfig.json"-{hooked=false}` — renames this file (runs at postbuild because `hooked=false`)

**using `hooked=false`:**

- `// dler-rename-file-"tsconfig.json"-{hooked=false}` — renames the file immediately at postbuild (not hooked)

**triggering spells:**

from dler's cli:  

- `dler spells --trigger rename-file,... --files tsconfig.json,...`
- `dler spells --trigger all`
- `dler spells`

from your own code:

```ts
await dler.spells({ spells: ["rename-file"], files: [] });
await dler.spells({}) // all spells, all files
spells: ["all"] // means all spells
spells: [] // also means all spells
files: [] // means all files
```
*/

/* // Using the dler spells SDK in your own CLI tool
import { defineCommand } from "@reliverse/rempts";

import { spells } from "~/app/spell/spell-mod";

export default defineCommand({
  async run() {
    // Run all spells on all files
    const results = await spells();

    // Run specific spells on specific files
    const specificResults = await spells({
      spells: ["rename-file", "replace-line"],
      files: ["src/index.ts", "src/types.ts"],
    });

    // Dry run to preview changes
    const dryRunResults = await spells({
      dryRun: true,
    });

    console.log("[dler] Spell execution complete!");
    console.log(results);
    console.log(specificResults);
    console.log(dryRunResults);
  },
});
 */
