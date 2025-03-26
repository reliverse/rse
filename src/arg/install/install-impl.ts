import {
  defineCommand,
  multiselectPrompt,
  relinka,
  selectPrompt,
} from "@reliverse/prompts";
import { execa } from "execa";
import os from "os";

// Popular/frequently requested global npm packages
const popularGlobalNpmPackages = [
  "typescript",
  "eslint",
  "biome",
  "@reliverse/relidler",
];

// Basic set of desktop apps by OS
const popularDesktopApps = {
  darwin: ["obsidian", "vscode", "notion", "docker"],
  win32: ["obsidian", "vscode", "notion", "docker"],
  linux: ["obsidian", "vscode", "notion", "docker"],
};

export default defineCommand({
  meta: {
    name: "install",
    description: "Install global NPM packages or desktop apps",
  },
  args: {
    // The user can optionally specify one or more items to install
    items: {
      type: "positional",
      required: false,
      array: true,
      description: "Apps or packages to install",
    },
  },
  run: async ({ args }) => {
    // If the user provided one or more items, skip interactive menu
    const items = [args.items];
    if (items && items.length > 0) {
      return await handleDirectInstall(items);
    }

    // Otherwise, interactive selection
    relinka("info", "\n◆ Select Installation Type");
    const installType = await selectPrompt({
      title: "installType",
      content: "What do you want to install?",
      options: [
        { value: "cli apps", label: "CLI apps" },
        { value: "desktop apps", label: "Desktop apps" },
      ],
    });

    if (installType === "cli apps") {
      await handleCliApps();
    } else {
      await handleDesktopApps();
    }
  },
});

/**
 * Direct install path:
 * e.g. reliverse install bun obsidian node ...
 */
async function handleDirectInstall(items: string[]) {
  relinka("info", "\nDirect install of:", items.join(", "));

  // Separate into npm packages vs. desktop apps
  const { npmPackages, desktopApps } = separateApps(items);

  if (npmPackages.length > 0) {
    relinka("info", `Installing global NPM packages... ${npmPackages}`);
    await installGlobalNpmPackages(npmPackages);
  }

  if (desktopApps.length > 0) {
    relinka("info", `Installing desktop apps... ${desktopApps}`);
    await installDesktopApps(desktopApps);
  }
}

/**
 * Interactive CLI apps flow
 */
async function handleCliApps() {
  const selected = await multiselectPrompt({
    title: "selected",
    content: "Select CLI apps to install (space to toggle)",
    options: popularGlobalNpmPackages.map((pkg) => ({
      value: pkg,
      label: pkg,
    })),
  });

  if (!selected || selected.length === 0) {
    relinka("warn", "No CLI apps selected.");
    return;
  }

  await installGlobalNpmPackages(selected);
}

/**
 * Interactive Desktop apps flow
 */
async function handleDesktopApps() {
  const platform = os.platform() as keyof typeof popularDesktopApps;
  const apps = popularDesktopApps[platform] || [];

  if (apps.length === 0) {
    relinka("error", `No known desktop apps for ${platform}.`);
    return;
  }

  const selected = await multiselectPrompt({
    title: "selected",
    content: "Select desktop apps to install (space to toggle)",
    options: apps.map((app) => ({ value: app, label: app })),
  });

  if (!selected || selected.length === 0) {
    relinka("warn", "No desktop apps selected.");
    return;
  }

  await installDesktopApps(selected);
}

/**
 * Separate user-specified items into "npm packages" vs "desktop apps"
 * TODO: in the future we should do more advanced checks or read from a config map
 */
function separateApps(items: string[]) {
  const npmPackages: string[] = [];
  const desktopApps: string[] = [];

  for (const item of items) {
    if (
      popularGlobalNpmPackages.includes(item.toLowerCase()) ||
      isLikelyNpmPackage(item)
    ) {
      npmPackages.push(item);
    } else {
      desktopApps.push(item);
    }
  }
  return { npmPackages, desktopApps };
}

/**
 * Guess for npm packages
 */
function isLikelyNpmPackage(item: string): boolean {
  // If it doesn't contain a dot, or it starts with '@', we guess it's an npm package
  if (item.includes(".") === false || item.startsWith("@")) {
    return true;
  }
  return false;
}

/**
 * Install a list of packages globally with npm
 */
async function installGlobalNpmPackages(packages: string[]) {
  try {
    await execa("npm", ["install", "-g", ...packages], { stdio: "inherit" });
    relinka(
      "success",
      `Global NPM install finished for: ${packages.join(", ")}`,
    );
  } catch (error) {
    relinka("error", "Failed to install NPM packages:", String(error));
  }
}

/**
 * Install a list of desktop apps depending on the OS:
 * - mac: brew
 * - windows: choco or winget
 * - linux: apt-get (for simplicity)
 */
async function installDesktopApps(apps: string[]) {
  const platform = os.platform();

  for (const app of apps) {
    try {
      if (platform === "darwin") {
        // Mac
        relinka("info", `Installing ${app} via Homebrew...`);
        await execa("brew", ["install", app], { stdio: "inherit" });
      } else if (platform === "win32") {
        // Windows
        relinka("info", `Installing ${app} via Chocolatey/winget...`);
        await execa("choco", ["install", app, "-y"], { stdio: "inherit" });
      } else {
        // Linux
        relinka("info", `Installing ${app} via apt-get...`);
        await execa("sudo", ["apt-get", "install", "-y", app], {
          stdio: "inherit",
        });
      }
      relinka("success", `Installed: ${app}`);
    } catch (error) {
      relinka("error", `Failed to install ${app}`, String(error));
    }
  }
}
