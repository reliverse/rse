import path from "@reliverse/pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import { logger } from "@reliverse/dler-logger";
import { createSpinner } from "@reliverse/dler-spinner";
import { isCancel, multiselectPrompt } from "@reliverse/dler-prompt";
import { execa } from "execa";
import fs from "@reliverse/relifso";
import { re } from "@reliverse/dler-colors";
import { exitCancelled } from "../../utils/errors";
import { getPackageExecutionCommand } from "../../utils/package-runner";
import type { ProjectConfig } from "../../types";

export async function setupRuler(config: ProjectConfig) {
	const { packageManager, projectDir } = config;

	try {
		logger.info("Setting up Ruler...");

		const rulerDir = path.join(projectDir, ".ruler");

		if (!(await fs.pathExists(rulerDir))) {
			logger.error(
				re.red(
					"Ruler template directory not found. Please ensure ruler addon is properly installed.",
				),
			);
			return;
		}

		const EDITORS = {
			amp: { label: "AMP" },
			copilot: { label: "GitHub Copilot" },
			claude: { label: "Claude Code" },
			codex: { label: "OpenAI Codex CLI" },
			cursor: { label: "Cursor" },
			windsurf: { label: "Windsurf" },
			cline: { label: "Cline" },
			aider: { label: "Aider" },
			firebase: { label: "Firebase Studio" },
			"gemini-cli": { label: "Gemini CLI" },
			junie: { label: "Junie" },
			kilocode: { label: "Kilo Code" },
			opencode: { label: "OpenCode" },
			crush: { label: "Crush" },
			zed: { label: "Zed" },
			qwen: { label: "Qwen" },
			amazonqcli: { label: "Amazon Q CLI" },
			augmentcode: { label: "AugmentCode" },
			firebender: { label: "Firebender" },
			goose: { label: "Goose" },
			jules: { label: "Jules" },
			kiro: { label: "Kiro" },
			openhands: { label: "Open Hands" },
			roo: { label: "RooCode" },
			trae: { label: "Trae AI" },
			warp: { label: "Warp" },
		} as const;

		const selectedEditors = await multiselectPrompt({
			message: "Select AI assistants for Ruler",
			options: Object.entries(EDITORS).map(([key, v]) => ({
				value: key,
				label: v.label,
			})),
		});

		if (isCancel(selectedEditors)) return exitCancelled("Operation cancelled");

		if (selectedEditors.length === 0) {
			logger.info("No AI assistants selected. To apply rules later, run:");
			logger.info(
				re.cyan(
					`${getPackageExecutionCommand(packageManager, "@intellectronica/ruler@latest apply --local-only")}`,
				),
			);
			return;
		}

		const configFile = path.join(rulerDir, "ruler.toml");
		const currentConfig = await fs.readFile(configFile, "utf-8");

		let updatedConfig = currentConfig;

		const defaultAgentsLine = `default_agents = [${selectedEditors.map((editor) => `"${editor}"`).join(", ")}]`;
		updatedConfig = updatedConfig.replace(
			/default_agents = \[\]/,
			defaultAgentsLine,
		);

		await fs.writeFile(configFile, updatedConfig);

		await addRulerScriptToPackageJson(projectDir, packageManager);

		const s = createSpinner();
		s.start("Applying rules with Ruler...");

		try {
			const rulerApplyCmd = getPackageExecutionCommand(
				packageManager,
				`@intellectronica/ruler@latest apply --agents ${selectedEditors.join(",")} --local-only`,
			);
			await execa(rulerApplyCmd, {
				cwd: projectDir,
				env: { CI: "true" },
				shell: true,
			});

			s.stop("Applied rules with Ruler");
		} catch (_error) {
			s.stop(re.red("Failed to apply rules"));
		}
	} catch (error) {
		logger.error(re.red("Failed to set up Ruler"));
		if (error instanceof Error) {
			console.error(re.red(error.message));
		}
	}
}

async function addRulerScriptToPackageJson(
	projectDir: string,
	packageManager: ProjectConfig["packageManager"],
) {
	const rootPackageJsonPath = path.join(projectDir, "package.json");

	if (!(await fs.pathExists(rootPackageJsonPath))) {
		logger.warn(
			"Root package.json not found, skipping ruler:apply script addition",
		);
		return;
	}

	const packageJson = await readPackageJSON(path.dirname(rootPackageJsonPath));

	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}

	const rulerApplyCommand = getPackageExecutionCommand(
		packageManager,
		"@intellectronica/ruler@latest apply --local-only",
	);
	packageJson.scripts["ruler:apply"] = rulerApplyCommand;

	await writePackageJSON(path.dirname(rootPackageJsonPath), packageJson);
}
