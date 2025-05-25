import type { ProjectConfig } from "../types.js";

export function generateReproducibleCommand(config: ProjectConfig): string {
  const flags: string[] = [];

  if (config.database === "none") {
    flags.push("--database none");
  } else {
    flags.push(`--database ${config.database}`);

    if (config.orm) {
      flags.push(`--orm ${config.orm}`);
    }

    if (config.dbSetup) {
      flags.push(`--db-setup ${config.dbSetup}`);
    }
  }

  if (config.api) {
    flags.push(`--api ${config.api}`);
  }

  flags.push(config.auth ? "--auth" : "--no-auth");
  flags.push(config.git ? "--git" : "--no-git");
  flags.push(config.install ? "--install" : "--no-install");

  if (config.runtime) {
    flags.push(`--runtime ${config.runtime}`);
  }

  if (config.backend) {
    flags.push(`--backend ${config.backend}`);
  }

  if (config.frontend && config.frontend.length > 0) {
    flags.push(`--frontend ${config.frontend.join(" ")}`);
  }

  if (config.addons && config.addons.length > 0) {
    flags.push(`--addons ${config.addons.join(" ")}`);
  } else {
    flags.push("--addons none");
  }

  if (config.examples && config.examples.length > 0) {
    flags.push(`--examples ${config.examples.join(" ")}`);
  } else {
    flags.push("--examples none");
  }

  if (config.packageManager) {
    flags.push(`--package-manager ${config.packageManager}`);
  }

  let baseCommand = "";
  const pkgManager = config.packageManager;

  if (pkgManager === "npm") {
    baseCommand = "npx create-better-t-stack@latest";
  } else if (pkgManager === "pnpm") {
    baseCommand = "pnpm create better-t-stack@latest";
  } else if (pkgManager === "bun") {
    baseCommand = "bun create better-t-stack@latest";
  }

  const projectName = config.projectName ? ` ${config.projectName}` : "";

  return `${baseCommand}${projectName} ${flags.join(" ")}`;
}
