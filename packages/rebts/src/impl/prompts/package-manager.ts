import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import { exitCancelled } from "../utils/errors";
import { getUserPkgManager } from "../utils/get-package-manager";
import type { PackageManager } from "../types";

export async function getPackageManagerChoice(packageManager?: PackageManager) {
	if (packageManager !== undefined) return packageManager;

	const detectedPackageManager = getUserPkgManager();

	const response = await selectPrompt<PackageManager>({
		message: "Choose package manager",
		options: [
			{ value: "npm", label: "npm", hint: "Node Package Manager" },
			{
				value: "pnpm",
				label: "pnpm",
				hint: "Fast, disk space efficient package manager",
			},
			{
				value: "bun",
				label: "bun",
				hint: "All-in-one JavaScript runtime & toolkit",
			},
		],
	});

	if (isCancel(response)) return exitCancelled("Operation cancelled");

	return response;
}
