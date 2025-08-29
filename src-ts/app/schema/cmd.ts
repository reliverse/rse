import { cliConfigJsonc, generateSchemaFile } from "@reliverse/dler";
import path from "@reliverse/pathkit";
import { relinka } from "@reliverse/relinka";
import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "schema",
    description: `Generate schema.json for ${cliConfigJsonc} configuration`,
    hidden: true,
  },
  args: defineArgs({
    cwd: {
      type: "string",
      description: "The directory to generate the schema.json file",
      required: true,
    },
  }),
  run: async ({ args }) => {
    const { cwd } = args;
    const cwdStr = String(cwd);
    try {
      await generateSchemaFile({
        filePath: path.resolve(cwdStr, "schema.json"),
        schemaOrFactory: {
          title: "My Schema",
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
          additionalProperties: false,
        },
      });
      relinka("success", `Generated schema.json for ${cliConfigJsonc} successfully!`);
    } catch (error) {
      relinka(
        "error",
        "Failed to generate schema:",
        error instanceof Error ? error.message : JSON.stringify(error),
      );
      process.exit(1);
    }
  },
});
