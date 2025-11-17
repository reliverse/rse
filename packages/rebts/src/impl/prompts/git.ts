import { confirmPrompt, isCancel } from "@reliverse/dler-prompt";
import { DEFAULT_CONFIG } from "../constants";
import { exitCancelled } from "../utils/errors";

export async function getGitChoice(git?: boolean) {
	if (git !== undefined) return git;

	const response = await confirmPrompt({
		message: "Initialize git repository?",
	});

	if (isCancel(response)) return exitCancelled("Operation cancelled");

	return response;
}
