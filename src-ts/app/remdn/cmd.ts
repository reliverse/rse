import { defineArgs, defineCommand } from "@reliverse/rempts";

export default defineCommand({
  meta: {
    name: "remdn",
    description: "Run remdn (undocs alternative)",
  },
  args: defineArgs({
    mode: {
      type: "string",
      // - dirs-scan-only: scan directories and generate a table of files
      // - dirs-scan-compare: compare directories and generate a table of files with extension checks
      allowed: ["dirs-scan-only", "dirs-scan-compare"],
      description: "Operation mode",
    },
    configPath: {
      type: "string",
      description:
        "Path to the configuration file. Can be:\n" +
        "- Just filename with .json or .ts extension (e.g. 'config.json', 'config.ts') - will look in current directory\n" +
        "- Full path with .json or .ts extension (e.g. '/path/to/config.json', '/path/to/config.ts') - must exist\n" +
        `If not provided, will use default configuration at ${DEFAULT_CONFIG_PATH}`,
    },
    outputFilePath: {
      type: "string",
      description:
        "Path to the output file. Can be:\n" +
        "- Just filename with .md or .html extension (e.g. 'output.md', 'output.html') - will be created in current directory\n" +
        "- Full path with .md or .html extension (e.g. '/path/to/output.md', '/path/to/output.html') - directory must exist\n" +
        "If not provided, will use default: table.html",
    },
    initConfig: {
      type: "string",
      description:
        "Initialize a new configuration file. Can be:\n" +
        "- Just filename with .json or .ts extension (e.g. 'config.json', 'config.ts') - will be created in current directory\n" +
        "- Full path with .json or .ts extension (e.g. '/path/to/config.json', '/path/to/config.ts') - directory must exist\n" +
        `If not provided, will create at ${DEFAULT_CONFIG_PATH}`,
    },
  }),
  async run({ args }) {
    let { configPath, outputFilePath, mode, initConfig } = args;

    // Handle initConfig first
    if (initConfig) {
      initConfig = ensureOutputPath(initConfig);
      validateConfigPath(initConfig);
      await createDefaultConfig(initConfig);
      return;
    }

    // Read config first
    const config = configPath ? await readConfig(configPath) : await readConfig();

    if (!outputFilePath) {
      outputFilePath = config.output ?? "table.html";
    } else {
      outputFilePath = ensureOutputPath(outputFilePath);
      // Validate extension
      validateOutputPath(outputFilePath);
    }

    if (configPath) {
      configPath = await ensureConfigPath(configPath);
      // Validate extension
      validateConfigPath(configPath);
    }

    if (!mode) {
      mode = await selectPrompt({
        title: "Select operation mode",
        options: [
          {
            label:
              "Only scan directories and generate a table of files (recommended for most cases)",
            value: "dirs-scan-only",
          },
          {
            label: "Scan directories and generate a table of files + do extension checks",
            value: "dirs-scan-compare",
          },
        ],
      });
    }

    // Only include ext-map if dirs-scan-compare mode is enabled
    const finalConfig: ConfigRemdn =
      mode === "dirs-scan-compare"
        ? config
        : {
            ...config,
            "ext-map": undefined,
          };

    await scanDirectories(finalConfig, configPath, outputFilePath);
  },
});
