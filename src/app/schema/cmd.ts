import { relinka } from "@reliverse/relinka";
import { defineCommand } from "@reliverse/rempts";

import { cliConfigJsonc } from "~/libs/sdk/utils/rseConfig/rc-details";
import { generateSchemaFile } from "~/libs/sdk/utils/rseConfig/rc-schema";

export default defineCommand({
  meta: {
    name: "schema",
    description: `Generate JSON schema for ${cliConfigJsonc} configuration`,
    hidden: true,
  },
  run: async () => {
    try {
      await generateSchemaFile();
      relinka(
        "success",
        `Generated schema.json for ${cliConfigJsonc} successfully!`,
      );
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
