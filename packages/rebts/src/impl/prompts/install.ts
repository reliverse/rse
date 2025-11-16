import { logger } from "@reliverse/dler-logger";
import { isCancel } from "@reliverse/dler-prompt";
import { DEFAULT_CONFIG } from "../constants";
import { exitCancelled } from "../utils/errors";

export async function getinstallChoice(install?: boolean) {
	if (install !== undefined) return install;

	const response = await confirm({
		title: "Install dependencies?",
	});

	if (isCancel(response)) return exitCancelled("Operation cancelled");

	return response;
}
