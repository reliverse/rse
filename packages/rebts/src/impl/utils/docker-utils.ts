import os from "node:os";
import { $ } from "execa";
import { re } from "@reliverse/dler-colors";
import { commandExists } from "./command-exists";
import type { Database } from "../types";

export async function isDockerInstalled() {
	return commandExists("docker");
}

export async function isDockerRunning() {
	try {
		await $`docker info`;
		return true;
	} catch {
		return false;
	}
}

export function getDockerInstallInstructions(
	platform: string,
	database: Database,
) {
	const isMac = platform === "darwin";
	const isWindows = platform === "win32";
	const isLinux = platform === "linux";

	let installUrl = "";
	let platformName = "";

	if (isMac) {
		installUrl = "https://docs.docker.com/desktop/setup/install/mac-install/";
		platformName = "macOS";
	} else if (isWindows) {
		installUrl =
			"https://docs.docker.com/desktop/setup/install/windows-install/";
		platformName = "Windows";
	} else if (isLinux) {
		installUrl = "https://docs.docker.com/desktop/setup/install/linux/";
		platformName = "Linux";
	}

	const databaseName =
		database === "mongodb"
			? "MongoDB"
			: database === "mysql"
				? "MySQL"
				: "PostgreSQL";

	return `${re.yellow("IMPORTANT:")} Docker required for ${databaseName}. Install for ${platformName}:\n${re.blue(installUrl)}`;
}

export async function getDockerStatus(database: Database) {
	const platform = os.platform();
	const installed = await isDockerInstalled();

	if (!installed) {
		return {
			installed: false,
			running: false,
			title: getDockerInstallInstructions(platform, database),
		};
	}

	const running = await isDockerRunning();
	if (!running) {
		return {
			installed: true,
			running: false,
			title: `${re.yellow("IMPORTANT:")} Docker is installed but not running.`,
		};
	}

	return {
		installed: true,
		running: true,
	};
}
