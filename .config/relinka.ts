import { defineConfig } from "@reliverse/relinka";

/**
 * RELINKA CONFIGURATION FILE
 * - Hover over a field to see the information
 * - Use intellisense to see available options
 * @see https://github.com/reliverse/relinka
 */
export default defineConfig({
  // Enable to see verbose logs
  verbose: true,

  // Timestamp configuration
  timestamp: {
    enabled: false,
    format: "HH:mm:ss",
  },

  // Control whether logs are saved to a file
  saveLogsToFile: true,

  // Disable colors in the console
  disableColors: false,

  // Log file configuration
  logFile: {
    outputPath: "logs.log",
    nameWithDate: "disable",
    freshLogFile: true,
  },

  // Dirs settings
  dirs: {
    maxLogFiles: 5,
  },

  levels: {
    success: {
      symbol: "✓",
      fallbackSymbol: "[OK]",
      color: "greenBright",
      spacing: 3,
    },
    info: {
      symbol: "i",
      fallbackSymbol: "[i]",
      color: "cyanBright",
      spacing: 3,
    },
    error: {
      symbol: "✖",
      fallbackSymbol: "[ERR]",
      color: "redBright",
      spacing: 3,
    },
    warn: {
      symbol: "⚠",
      fallbackSymbol: "[WARN]",
      color: "yellowBright",
      spacing: 3,
    },
    fatal: {
      symbol: "‼",
      fallbackSymbol: "[FATAL]",
      color: "redBright",
      spacing: 3,
    },
    verbose: {
      symbol: "✧",
      fallbackSymbol: "[VERBOSE]",
      color: "gray",
      spacing: 3,
    },
    internal: {
      symbol: "⚙",
      fallbackSymbol: "[INTERNAL]",
      color: "magentaBright",
      spacing: 3,
    },
    log: { symbol: "│", fallbackSymbol: "|", color: "dim", spacing: 3 },
    message: {
      symbol: "🞠",
      fallbackSymbol: "[MSG]",
      color: "cyan",
      spacing: 3,
    },
  },
});
