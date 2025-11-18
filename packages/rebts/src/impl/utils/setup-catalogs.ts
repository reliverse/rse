import path from "@reliverse/dler-pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import fs from "@reliverse/dler-fs-utils";
import yaml from "yaml";
import type { ProjectConfig } from "../types";

type PackageInfo = {
	path: string;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
};

type CatalogEntry = {
	version: string;
	packages: string[];
};

export async function setupCatalogs(
	projectDir: string,
	options: ProjectConfig,
) {
	if (options.packageManager === "npm") {
		return;
	}

	const packagePaths = [
		"apps/server",
		"apps/web",
		// "apps/native", // having issues
		"apps/fumadocs",
		"apps/docs",
		"packages/api",
		"packages/db",
		"packages/auth",
		"packages/backend",
	];

	const packagesInfo: PackageInfo[] = [];

	for (const pkgPath of packagePaths) {
		const fullPath = path.join(projectDir, pkgPath);
		const pkgJsonPath = path.join(fullPath, "package.json");

		if (await fs.pathExists(pkgJsonPath)) {
			const pkgJson = await readPackageJSON(path.dirname(pkgJsonPath));
			packagesInfo.push({
				path: fullPath,
				dependencies: pkgJson.dependencies || {},
				devDependencies: pkgJson.devDependencies || {},
			});
		}
	}

	const catalog = findDuplicateDependencies(packagesInfo, options.projectName);

	if (Object.keys(catalog).length === 0) {
		return;
	}

	if (options.packageManager === "bun") {
		await setupBunCatalogs(projectDir, catalog);
	} else if (options.packageManager === "pnpm") {
		await setupPnpmCatalogs(projectDir, catalog);
	}

	await updatePackageJsonsWithCatalogs(packagesInfo, catalog);
}

function findDuplicateDependencies(
	packagesInfo: PackageInfo[],
	projectName: string,
): Record<string, string> {
	const depCount = new Map<string, CatalogEntry>();
	const projectScope = `@${projectName}/`;

	for (const pkg of packagesInfo) {
		const allDeps = {
			...pkg.dependencies,
			...pkg.devDependencies,
		};

		for (const [depName, version] of Object.entries(allDeps)) {
			if (depName.startsWith(projectScope)) {
				continue;
			}

			if (version.startsWith("workspace:")) {
				continue;
			}

			const existing = depCount.get(depName);
			if (existing) {
				existing.packages.push(pkg.path);
			} else {
				depCount.set(depName, {
					version,
					packages: [pkg.path],
				});
			}
		}
	}

	const catalog: Record<string, string> = {};
	for (const [depName, info] of depCount.entries()) {
		if (info.packages.length > 1) {
			catalog[depName] = info.version;
		}
	}

	return catalog;
}

async function setupBunCatalogs(
	projectDir: string,
	catalog: Record<string, string>,
) {
	const rootPkgJsonPath = path.join(projectDir, "package.json");
	const rootPkgJson = await readPackageJSON(path.dirname(rootPkgJsonPath));

	if (!rootPkgJson.workspaces) {
		rootPkgJson.workspaces = {};
	}

	if (Array.isArray(rootPkgJson.workspaces)) {
		rootPkgJson.workspaces = {
			packages: rootPkgJson.workspaces,
			catalog,
		};
	} else if (typeof rootPkgJson.workspaces === "object") {
		if (!(rootPkgJson.workspaces as { catalog?: Record<string, string>; packages?: string[]; nohoist?: string[] }).catalog) {
			(rootPkgJson.workspaces as { catalog?: Record<string, string>; packages?: string[]; nohoist?: string[] }).catalog = {};
		}
		(rootPkgJson.workspaces as { catalog?: Record<string, string>; packages?: string[]; nohoist?: string[] }).catalog = {
			...(rootPkgJson.workspaces as { catalog?: Record<string, string>; packages?: string[]; nohoist?: string[] }).catalog,
			...catalog,
		};
	}

	await writePackageJSON(path.dirname(rootPkgJsonPath), rootPkgJson);
}

async function setupPnpmCatalogs(
	projectDir: string,
	catalog: Record<string, string>,
) {
	const workspaceYamlPath = path.join(projectDir, "pnpm-workspace.yaml");

	if (!(await fs.pathExists(workspaceYamlPath))) {
		return;
	}

	const workspaceContent = await fs.readFile(workspaceYamlPath, { encoding: "utf-8" });
	const workspaceYaml = yaml.parse(workspaceContent);

	if (!workspaceYaml.catalog) {
		workspaceYaml.catalog = {};
	}

	workspaceYaml.catalog = {
		...workspaceYaml.catalog,
		...catalog,
	};

	await fs.writeFile(workspaceYamlPath, yaml.stringify(workspaceYaml));
}

async function updatePackageJsonsWithCatalogs(
	packagesInfo: PackageInfo[],
	catalog: Record<string, string>,
) {
	for (const pkg of packagesInfo) {
		const pkgJsonPath = path.join(pkg.path, "package.json");
		const pkgJson = await readPackageJSON(path.dirname(pkgJsonPath));

		let updated = false;

		if (pkgJson.dependencies) {
			for (const depName of Object.keys(pkgJson.dependencies)) {
				if (catalog[depName]) {
					pkgJson.dependencies[depName] = "catalog:";
					updated = true;
				}
			}
		}

		if (pkgJson.devDependencies) {
			for (const depName of Object.keys(pkgJson.devDependencies)) {
				if (catalog[depName]) {
					pkgJson.devDependencies[depName] = "catalog:";
					updated = true;
				}
			}
		}

		if (updated) {
			await writePackageJSON(path.dirname(pkgJsonPath), pkgJson);
		}
	}
}
