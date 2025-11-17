import path from "@reliverse/pathkit";
import { logger } from "@reliverse/dler-logger";
import { isCancel, selectPrompt } from "@reliverse/dler-prompt";
import { execa, type ExecaError } from "execa";
import fs from "@reliverse/relifso";
import { re } from "@reliverse/dler-colors";
import { exitCancelled } from "../../utils/errors";
import { getPackageExecutionCommand } from "../../utils/package-runner";
import { addEnvVariablesToFile, type EnvVariable } from "../core/env-setup";
import type { PackageManager, ProjectConfig } from "../../types";

async function writeSupabaseEnvFile(
	projectDir: string,
	backend: ProjectConfig["backend"],
	databaseUrl: string,
) {
	try {
		const targetApp = backend === "self" ? "apps/web" : "apps/server";
		const envPath = path.join(projectDir, targetApp, ".env");
		const dbUrlToUse =
			databaseUrl || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
		const variables: EnvVariable[] = [
			{
				key: "DATABASE_URL",
				value: dbUrlToUse,
				condition: true,
			},
			{
				key: "DIRECT_URL",
				value: dbUrlToUse,
				condition: true,
			},
		];
		await addEnvVariablesToFile(envPath, variables);
		return true;
	} catch (error) {
		logger.error(re.red("Failed to update .env file for Supabase."));
		if (error instanceof Error) {
			logger.error(error.message);
		}
		return false;
	}
}

function extractDbUrl(output: string) {
	const dbUrlMatch = output.match(/DB URL:\s*(postgresql:\/\/[^\s]+)/);
	const url = dbUrlMatch?.[1];
	if (url) {
		return url;
	}
	return null;
}

async function initializeSupabase(
	serverDir: string,
	packageManager: PackageManager,
) {
	logger.info("Initializing Supabase project...");
	try {
		const supabaseInitCommand = getPackageExecutionCommand(
			packageManager,
			"supabase init",
		);
		await execa(supabaseInitCommand, {
			cwd: serverDir,
			stdio: "inherit",
			shell: true,
		});
		logger.success("Supabase project initialized");
		return true;
	} catch (error) {
		logger.error(re.red("Failed to initialize Supabase project."));
		if (error instanceof Error) {
			logger.error(error.message);
		} else {
			logger.error(String(error));
		}
		if (error instanceof Error && error.message.includes("ENOENT")) {
			logger.error(
				re.red(
					"Supabase CLI not found. Please install it globally or ensure it's in your PATH.",
				),
			);
			logger.info("You can install it using: npm install -g supabase");
		}
		return false;
	}
}

async function startSupabase(
	serverDir: string,
	packageManager: PackageManager,
) {
	logger.info("Starting Supabase services (this may take a moment)...");
	const supabaseStartCommand = getPackageExecutionCommand(
		packageManager,
		"supabase start",
	);
	try {
		const subprocess = execa(supabaseStartCommand, {
			cwd: serverDir,
			shell: true,
		});

		let stdoutData = "";

		if (subprocess.stdout) {
			subprocess.stdout.on("data", (data) => {
				const text = data.toString();
				process.stdout.write(text);
				stdoutData += text;
			});
		}

		if (subprocess.stderr) {
			subprocess.stderr.pipe(process.stderr);
		}

		await subprocess;

		await new Promise((resolve) => setTimeout(resolve, 100));

		return stdoutData;
	} catch (error) {
		logger.error(re.red("Failed to start Supabase services."));
		const execaError = error as ExecaError;
		if (execaError?.message) {
			logger.error(`Error details: ${execaError.message}`);
			if (execaError.message.includes("Docker is not running")) {
				logger.error(
					re.red("Docker is not running. Please start Docker and try again."),
				);
			}
		} else {
			logger.error(String(error));
		}
		return null;
	}
}

function displayManualSupabaseInstructions(output?: string | null) {
	logger.info(
		`"Manual Supabase Setup Instructions:"
1. Ensure Docker is installed and running.
2. Install the Supabase CLI (e.g., \`npm install -g supabase\`).
3. Run \`supabase init\` in your project's \`packages/db\` directory.
4. Run \`supabase start\` in your project's \`packages/db\` directory.
5. Copy the 'DB URL' from the output.${
			output
				? `
${re.bold("Relevant output from `supabase start`:")}
${re.dim(output)}`
				: ""
		}
6. Add the DB URL to the .env file in \`packages/db/.env\` as \`DATABASE_URL\`:
			${re.gray('DATABASE_URL="your_supabase_db_url"')}`,
	);
}

export async function setupSupabase(
	config: ProjectConfig,
	cliInput?: { manualDb?: boolean },
) {
	const { projectDir, packageManager, backend } = config;
	const manualDb = cliInput?.manualDb ?? false;

	const serverDir = path.join(projectDir, "packages", "db");

	try {
		await fs.ensureDir(serverDir);

		if (manualDb) {
			displayManualSupabaseInstructions();
			await writeSupabaseEnvFile(projectDir, backend, "");
			return;
		}

		const mode = await selectPrompt({
			message: "Supabase setup: choose mode",
			options: [
				{
					label: "Automatic",
					value: "auto",
					hint: "Automated setup with provider CLI, sets .env",
				},
				{
					label: "Manual",
					value: "manual",
					hint: "Manual setup, add env vars yourself",
				},
			],
		});

		if (isCancel(mode)) return exitCancelled("Operation cancelled");

		if (mode === "manual") {
			displayManualSupabaseInstructions();
			await writeSupabaseEnvFile(projectDir, backend, "");
			return;
		}

		const initialized = await initializeSupabase(serverDir, packageManager);
		if (!initialized) {
			displayManualSupabaseInstructions();
			return;
		}

		const supabaseOutput = await startSupabase(serverDir, packageManager);
		if (!supabaseOutput) {
			displayManualSupabaseInstructions();
			return;
		}

		const dbUrl = extractDbUrl(supabaseOutput);

		if (dbUrl) {
			const envUpdated = await writeSupabaseEnvFile(projectDir, backend, dbUrl);

			if (envUpdated) {
				logger.success(re.green("Supabase local development setup ready!"));
			} else {
				logger.error(
					re.red(
						"Supabase setup completed, but failed to update .env automatically.",
					),
				);
				displayManualSupabaseInstructions(supabaseOutput);
			}
		} else {
			logger.error(
				re.yellow(
					"Supabase started, but could not extract DB URL automatically.",
				),
			);
			displayManualSupabaseInstructions(supabaseOutput);
		}
	} catch (error) {
		if (error instanceof Error) {
			logger.error(re.red(`Error during Supabase setup: ${error.message}`));
		} else {
			logger.error(
				re.red(
					`An unknown error occurred during Supabase setup: ${String(error)}`,
				),
			);
		}
		displayManualSupabaseInstructions();
	}
}
