import path from "@reliverse/dler-pathkit";
import { inputPrompt, isCancel } from "@reliverse/dler-prompt";
import { logger } from "@reliverse/dler-logger";
import fs from "@reliverse/dler-fs-utils";
import { re } from "@reliverse/dler-colors";
import { DEFAULT_CONFIG } from "../constants";
import { ProjectNameSchema } from "../types";
import { exitCancelled } from "../utils/errors";

function isPathWithinCwd(targetPath: string) {
	const resolved = path.resolve(targetPath);
	const rel = path.relative(process.cwd(), resolved);
	return !rel.startsWith("..") && !path.isAbsolute(rel);
}

function validateDirectoryName(name: string) {
	if (name === ".") return undefined;

	const result = ProjectNameSchema.safeParse(name);
	if (!result.success) {
		return result.error.issues[0]?.message || "Invalid project name";
	}
	return undefined;
}

export async function getProjectName(initialName?: string) {
	if (initialName) {
		if (initialName === ".") {
			return initialName;
		}
		const finalDirName = path.basename(initialName);
		const validationError = validateDirectoryName(finalDirName);
		if (!validationError) {
			const projectDir = path.resolve(process.cwd(), initialName);
			if (isPathWithinCwd(projectDir)) {
				return initialName;
			}
			logger.error(re.red("Project path must be within current directory"));
		}
	}

	let isValid = false;
	let projectPath = "";
	let defaultName: string = DEFAULT_CONFIG.projectName;
	let counter = 1;

	while (
		(await fs.pathExists(path.resolve(process.cwd(), defaultName))) &&
		(await fs.readdir(path.resolve(process.cwd(), defaultName))).length > 0
	) {
		defaultName = `${DEFAULT_CONFIG.projectName}-${counter}`;
		counter++;
	}

	while (!isValid) {
		const response = await inputPrompt({
			message:
				"Enter your project name or path (relative to current directory)",
			defaultValue: defaultName,
			validate: (value) => {
				const nameToUse = String(value ?? "").trim() || defaultName;

				const finalDirName = path.basename(nameToUse);
				const validationError = validateDirectoryName(finalDirName);
				if (validationError) return validationError;

				if (nameToUse !== ".") {
					const projectDir = path.resolve(process.cwd(), nameToUse);
					if (!isPathWithinCwd(projectDir)) {
						return "Project path must be within current directory";
					}
				}

				return undefined;
			},
		});

		if (isCancel(response)) return exitCancelled("Operation cancelled.");

		projectPath = response || defaultName;
		isValid = true;
	}

	return projectPath;
}
