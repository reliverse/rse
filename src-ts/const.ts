export type CmdName =
  | "rse"
  | "build"
  | "publish"
  | "deploy"
  | "native"
  | "update"
  | "agg"
  | "upgrade";

export const msgs = {
  args: {
    ci: "Whether to run in CI mode (useful for GitHub Actions and other non-interactive environments)",
    cwd: "The working directory to run the CLI in",
    dev: "Whether to run in dev mode (useful only for debugging and Rse CLI contributors)",
  },
  cmds: {
    rse: "Displays an interactive Rse CLI main menu. To see ALL available commands and their flags, run: rse --help",
    build: "Build the project (without publishing or deploying)",
    publish: "Build and publish the project to the NPM or JSR registry",
    deploy: "Deploy the project to GitHub or/and Vercel",
    native: "Run or install Rse CLI native binaries (kinds: bun, go, rust, web)",
    update: "Update all dependencies, even catalog deps, to their latest available versions",
    agg: "Aggregate your project exports into a single file",
    upgrade: "Upgrade your dev tools to the latest version (alias for `update --upgrade-tools`)",
  } as Record<CmdName, string>,
  info: {
    ci: "CI mode was activated. Proceeding with: default values -> reliverse.ts overrides -> flags overrides.",
    dev: "Running the CLI in dev mode.",
  },
};
