import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import { logger } from "@reliverse/dler-logger";
import { createSpinner } from "@reliverse/dler-spinner";
import { execa } from "execa";
import fs from "@reliverse/dler-fs-utils";
import { re } from "@reliverse/dler-colors";
import { addPackageDependency } from "../../utils/add-package-deps";
import { getPackageExecutionCommand } from "../../utils/package-runner";
import { setupFumadocs } from "./fumadocs-setup";
import { setupRuler } from "./ruler-setup";
import { setupStarlight } from "./starlight-setup";
import { setupTauri } from "./tauri-setup";
import { setupUltracite } from "./ultracite-setup";
import { addPwaToViteConfig } from "./vite-pwa-setup";
import type { Frontend, PackageManager, ProjectConfig } from "../../types";

export async function setupAddons(config: ProjectConfig, isAddCommand = false) {
	const { addons, frontend, projectDir, packageManager } = config;
	const hasReactWebFrontend =
		frontend.includes("react-router") ||
		frontend.includes("tanstack-router") ||
		frontend.includes("next");
	const hasNuxtFrontend = frontend.includes("nuxt");
	const hasSvelteFrontend = frontend.includes("svelte");
	const hasSolidFrontend = frontend.includes("solid");
	const hasNextFrontend = frontend.includes("next");

	if (addons.includes("turborepo")) {
		await addPackageDependency({
			devDependencies: ["turbo"],
			projectDir,
		});

		if (isAddCommand) {
			logger.info(`${re.yellow("Update your package.json scripts:")}

${re.dim("Replace:")} ${re.yellow('"pnpm -r dev"')} ${re.dim("→")} ${re.green(
				'"turbo dev"',
			)}
${re.dim("Replace:")} ${re.yellow('"pnpm --filter web dev"')} ${re.dim(
				"→",
			)} ${re.green('"turbo -F web dev"')}

${re.cyan("Docs:")} ${re.underline("https://turborepo.com/docs")}
		`);
		}
	}

	if (addons.includes("pwa") && (hasReactWebFrontend || hasSolidFrontend)) {
		await setupPwa(projectDir, frontend);
	}
	if (
		addons.includes("tauri") &&
		(hasReactWebFrontend ||
			hasNuxtFrontend ||
			hasSvelteFrontend ||
			hasSolidFrontend ||
			hasNextFrontend)
	) {
		await setupTauri(config);
	}
	const hasUltracite = addons.includes("ultracite");
	const hasBiome = addons.includes("biome");
	const hasHusky = addons.includes("husky");
	const hasOxlint = addons.includes("oxlint");

	if (hasUltracite) {
		await setupUltracite(config, hasHusky);
	} else {
		if (hasBiome) {
			await setupBiome(projectDir);
		}
		if (hasHusky) {
			let linter: "biome" | "oxlint" | undefined;
			if (hasOxlint) {
				linter = "oxlint";
			} else if (hasBiome) {
				linter = "biome";
			}
			await setupHusky(projectDir, linter);
		}
	}

	if (addons.includes("oxlint")) {
		await setupOxlint(projectDir, packageManager);
	}
	if (addons.includes("starlight")) {
		await setupStarlight(config);
	}

	if (addons.includes("ruler")) {
		await setupRuler(config);
	}
	if (addons.includes("fumadocs")) {
		await setupFumadocs(config);
	}
}

function getWebAppDir(projectDir: string, frontends: Frontend[]) {
	if (
		frontends.some((f) =>
			["react-router", "tanstack-router", "nuxt", "svelte", "solid"].includes(
				f,
			),
		)
	) {
		return path.join(projectDir, "apps/web");
	}
	return path.join(projectDir, "apps/web");
}

export async function setupBiome(projectDir: string) {
	await addPackageDependency({
		devDependencies: ["@biomejs/biome"],
		projectDir,
	});

	const packageJsonPath = path.join(projectDir, "package.json");
	if (await fs.pathExists(packageJsonPath)) {
		const packageJson = await readPackageJSON(path.dirname(packageJsonPath));

		packageJson.scripts = {
			...packageJson.scripts,
			check: "biome check --write .",
		};

		await writePackageJSON(path.dirname(packageJsonPath), packageJson);
	}
}

export async function setupHusky(
	projectDir: string,
	linter?: "biome" | "oxlint",
) {
	await addPackageDependency({
		devDependencies: ["husky", "lint-staged"],
		projectDir,
	});

	const packageJsonPath = path.join(projectDir, "package.json");
	if (await fs.pathExists(packageJsonPath)) {
		const packageJson = await readPackageJSON(path.dirname(packageJsonPath));

		packageJson.scripts = {
			...packageJson.scripts,
			prepare: "husky",
		};

		if (linter === "oxlint") {
			packageJson["lint-staged"] = {
				"**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,astro,svelte}": "oxlint",
			};
		} else if (linter === "biome") {
			packageJson["lint-staged"] = {
				"*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
					"biome check --write .",
				],
			};
		} else {
			packageJson["lint-staged"] = {
				"**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,astro,svelte}": "",
			};
		}

		await writePackageJSON(path.dirname(packageJsonPath), packageJson);
	}
}

async function setupPwa(projectDir: string, frontends: Frontend[]) {
	const isCompatibleFrontend = frontends.some((f) =>
		["react-router", "tanstack-router", "solid"].includes(f),
	);
	if (!isCompatibleFrontend) return;

	const clientPackageDir = getWebAppDir(projectDir, frontends);

	if (!(await fs.pathExists(clientPackageDir))) {
		return;
	}

	await addPackageDependency({
		dependencies: ["vite-plugin-pwa"],
		devDependencies: ["@vite-pwa/assets-generator"],
		projectDir: clientPackageDir,
	});

	const clientPackageJsonPath = path.join(clientPackageDir, "package.json");
	if (await fs.pathExists(clientPackageJsonPath)) {
		const packageJson = await readPackageJSON(path.dirname(clientPackageJsonPath));

		packageJson.scripts = {
			...packageJson.scripts,
			"generate-pwa-assets": "pwa-assets-generator",
		};

		await writePackageJSON(path.dirname(clientPackageJsonPath), packageJson);
	}

	const viteConfigTs = path.join(clientPackageDir, "vite.config.ts");

	if (await fs.pathExists(viteConfigTs)) {
		await addPwaToViteConfig(viteConfigTs, path.basename(projectDir));
	}
}

async function setupOxlint(projectDir: string, packageManager: PackageManager) {
	await addPackageDependency({
		devDependencies: ["oxlint"],
		projectDir,
	});

	const packageJsonPath = path.join(projectDir, "package.json");
	if (await fs.pathExists(packageJsonPath)) {
		const packageJson = await readPackageJSON(path.dirname(packageJsonPath));

		packageJson.scripts = {
			...packageJson.scripts,
			check: "oxlint",
		};

		await writePackageJSON(path.dirname(packageJsonPath), packageJson);
	}

	const oxlintInitCommand = getPackageExecutionCommand(
		packageManager,
		"oxlint@latest --init",
	);

	const s = createSpinner();
	s.start("Initializing oxlint...");

	await execa(oxlintInitCommand, {
		cwd: projectDir,
		env: { CI: "true" },
		shell: true,
	});

	s.stop("oxlint initialized successfully!");
}
