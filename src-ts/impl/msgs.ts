import type { CmdName } from "./types";

export const msgs = {
  args: {
    ci: "Whether to run in CI mode (useful for GitHub Actions and other non-interactive environments)",
    cwd: "The working directory to run the CLI in",
    dev: "Whether to run in dev mode (useful only for debugging and Rse CLI contributors)",
  },
  cmds: {
    rse: "Displays an interactive Rse CLI main menu. To see ALL commands, run: rse --help",
    build: "Build the project (without publishing)",
    publish: "Publish the project to the NPM or JSR registry",
    deploy: "Deploy the project to GitHub or/and Vercel",
    native: "Install Rse CLI native binaries",
    update: "Update all dependencies, even catalog deps, to their latest available versions",
  } as Record<CmdName, string>,
  info: {
    ci: "CI mode was activated. Proceeding with: default values -> reliverse.ts overrides -> flags overrides.",
    dev: "Running the CLI in dev mode.",
  },
};
