import path from "@reliverse/pathkit";
import { logger } from "@reliverse/dler-logger";
import fs from "@reliverse/relifso";
import handlebars from "handlebars";
import { formatFileWithBiome } from "./biome-formatter";
import type { ProjectConfig } from "../types";

const BINARY_EXTENSIONS = new Set([".png", ".ico", ".svg"]);

function isBinaryFile(filePath: string): boolean {
	const ext = path.extname(filePath).toLowerCase();
	return BINARY_EXTENSIONS.has(ext);
}

export async function processTemplate(
	srcPath: string,
	destPath: string,
	context: ProjectConfig,
) {
	try {
		await fs.ensureDir(path.dirname(destPath));

		if (isBinaryFile(srcPath) && !srcPath.endsWith(".hbs")) {
			await fs.copy(srcPath, destPath);
			return;
		}

		let content: string;

		if (srcPath.endsWith(".hbs")) {
			const templateContent = await fs.readFile(srcPath, "utf-8");
			const template = handlebars.compile(templateContent);
			content = template(context);
		} else {
			content = await fs.readFile(srcPath, "utf-8");
		}

		try {
			const formattedContent = await formatFileWithBiome(destPath, content);
			if (formattedContent) {
				content = formattedContent;
			}
		} catch (formatError) {
			logger.debug(`Failed to format ${destPath}:`, formatError);
		}

		await fs.writeFile(destPath, content);
	} catch (error) {
		logger.error(`Error processing template ${srcPath}:`, error);
		throw new Error(`Failed to process template ${srcPath}`);
	}
}

handlebars.registerHelper("eq", (a, b) => a === b);
handlebars.registerHelper("ne", (a, b) => a !== b);
handlebars.registerHelper("and", (...args) => {
	const values = args.slice(0, -1);
	return values.every((value) => value);
});
handlebars.registerHelper("or", (...args) => {
	const values = args.slice(0, -1);
	return values.some((value) => value);
});

handlebars.registerHelper(
	"includes",
	(array, value) => Array.isArray(array) && array.includes(value),
);
