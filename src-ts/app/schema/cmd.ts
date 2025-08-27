import { cliConfigJsonc } from "@reliverse/dler";
import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "schema",
    description: `Generate schema.json for ${cliConfigJsonc} configuration`,
    hidden: true,
  },
  run: async () => {
    try {
      await generateSchemaFile({}); // TODO: should generate schema.json file
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
