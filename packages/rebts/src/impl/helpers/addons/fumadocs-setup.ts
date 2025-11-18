import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import { logger } from "@reliverse/dler-logger";
import { createSpinner } from "@reliverse/dler-spinner";
import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import { execa } from "execa";
import fs from "@reliverse/dler-fs-utils";
import { re } from "@reliverse/dler-colors";
import { exitCancelled } from "../../utils/errors";
import { getPackageExecutionCommand } from "../../utils/package-runner";
import type { ProjectConfig } from "../../types";

type FumadocsTemplate =
	| "next-mdx"
	| "waku"
	| "react-router"
	| "react-router-spa"
	| "tanstack-start";

const TEMPLATES = {
	"next-mdx": {
		label: "Next.js: Fumadocs MDX",
		hint: "Recommended template with MDX support",
		value: "+next+fuma-docs-mdx",
	},
	waku: {
		label: "Waku: Content Collections",
		hint: "Template using Waku with content collections",
		value: "waku",
	},
	"react-router": {
		label: "React Router: MDX Remote",
		hint: "Template for React Router with MDX remote",
		value: "react-router",
	},
	"react-router-spa": {
		label: "React Router: SPA",
		hint: "Template for React Router SPA",
		value: "react-router-spa",
	},
	"tanstack-start": {
		label: "Tanstack Start: MDX Remote",
		hint: "Template for Tanstack Start with MDX remote",
		value: "tanstack-start",
	},
} as const;

export async function setupFumadocs(config: ProjectConfig) {
	const { packageManager, projectDir } = config;

	try {
		logger.info("Setting up Fumadocs...");

		const template = await selectPrompt<FumadocsTemplate>({
			message: "Choose a template",
			options: Object.entries(TEMPLATES).map(([key, template]) => ({
				value: key as FumadocsTemplate,
				label: template.label,
				hint: template.hint,
			})),
		});

		if (isCancel(template)) return exitCancelled("Operation cancelled");

		const templateArg = TEMPLATES[template].value;

		const commandWithArgs = `create-fumadocs-app@latest fumadocs --template ${templateArg} --src --pm ${packageManager} --no-git`;

		const fumadocsInitCommand = getPackageExecutionCommand(
			packageManager,
			commandWithArgs,
		);

		const appsDir = path.join(projectDir, "apps");
		await fs.ensureDir(appsDir);

		const s = createSpinner();
		s.start("Running Fumadocs create command...");

		await execa(fumadocsInitCommand, {
			cwd: appsDir,
			env: { CI: "true" },
			shell: true,
		});

		const fumadocsDir = path.join(projectDir, "apps", "fumadocs");
		const packageJsonPath = path.join(fumadocsDir, "package.json");

		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await readPackageJSON(path.dirname(packageJsonPath));
			packageJson.name = "fumadocs";

			if (packageJson.scripts?.dev) {
				packageJson.scripts.dev = `${packageJson.scripts.dev} --port=4000`;
			}

			await writePackageJSON(path.dirname(packageJsonPath), packageJson);
		}

		s.stop("Fumadocs setup complete!");
	} catch (error) {
		logger.error(re.red("Failed to set up Fumadocs"));
		if (error instanceof Error) {
			logger.error(re.red(error.message));
		}
	}
}
