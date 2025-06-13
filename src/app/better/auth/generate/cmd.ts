import { re } from "@reliverse/relico";
import fs from "@reliverse/relifso";
import { confirmPrompt, useSpinner, defineCommand } from "@reliverse/rempts";
import { logger } from "better-auth";
import { getAdapter } from "better-auth/db";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { getGenerator } from "~/app/better/auth/(generators)";
import { getConfig } from "~/app/better/auth/(utils)/get-config";

export default defineCommand({
  meta: {
    name: "generate",
    description: "Generate authentication schema",
  },
  args: {
    config: {
      type: "string",
      description: "Path to the configuration file",
      required: false,
    },
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
    output: {
      type: "string",
      description: "Output file path",
      required: false,
    },
    y: {
      type: "boolean",
      description: "Automatically answer yes to all prompts",
      default: false,
    },
  },
  run: async ({ args }) => {
    const options = z
      .object({
        config: z.string().optional(),
        cwd: z.string(),
        output: z.string().optional(),
        y: z.boolean().optional(),
      })
      .parse(args);

    const cwd = path.resolve(options.cwd);
    if (!existsSync(cwd)) {
      logger.error(`The directory "${cwd}" does not exist.`);
      process.exit(1);
    }
    const config = await getConfig({
      configPath: options.config,
      cwd,
    });
    if (!config) {
      logger.error(
        "No configuration file found. Add a `auth.ts` file to your project or pass the path to the configuration file using the `--config` flag.",
      );
      return;
    }

    const adapter = await getAdapter(config).catch((e) => {
      logger.error(e instanceof Error ? e.message : "Unknown error");
      process.exit(1);
    });

    const spinner = useSpinner({ text: "preparing schema..." }).start();

    const schema = await getGenerator({
      adapter,
      file: options.output,
      options: config,
    });

    spinner.stop();
    if (!schema.code) {
      logger.info("Your schema is already up to date.");
      process.exit(0);
    }
    if (schema.append || schema.overwrite) {
      let confirm = options.y;
      if (!confirm) {
        confirm = await confirmPrompt({
          title: `The file ${
            schema.fileName
          } already exists. Do you want to ${re.yellow(
            schema.overwrite ? "overwrite" : "append",
          )} the schema to the file?`,
        });
      }

      if (confirm) {
        const exist = existsSync(path.join(cwd, schema.fileName));
        if (!exist) {
          await fs.mkdir(path.dirname(path.join(cwd, schema.fileName)), {
            recursive: true,
          });
        }
        if (schema.overwrite) {
          await fs.writeFile(path.join(cwd, schema.fileName), schema.code);
        } else {
          await fs.appendFile(path.join(cwd, schema.fileName), schema.code);
        }
        logger.success(
          `🚀 Schema was ${
            schema.overwrite ? "overwritten" : "appended"
          } successfully!`,
        );
        process.exit(0);
      } else {
        logger.error("Schema generation aborted.");
        process.exit(1);
      }
    }

    let confirm = options.y;

    if (!confirm) {
      confirm = await confirmPrompt({
        title: `Do you want to generate the schema to ${re.yellow(
          schema.fileName,
        )}?`,
      });
    }

    if (!confirm) {
      logger.error("Schema generation aborted.");
      process.exit(1);
    }

    if (!options.output) {
      const dirExist = existsSync(
        path.dirname(path.join(cwd, schema.fileName)),
      );
      if (!dirExist) {
        await fs.mkdir(path.dirname(path.join(cwd, schema.fileName)), {
          recursive: true,
        });
      }
    }
    await fs.writeFile(
      options.output || path.join(cwd, schema.fileName),
      schema.code,
    );
    logger.success("🚀 Schema was generated successfully!");
    process.exit(0);
  },
});
