import path from "@reliverse/pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import fs from "@reliverse/relifso";
import { dependencyVersionMap, type AvailableDependencies } from "../constants";


export const addPackageDependency = async (opts: {
	dependencies?: AvailableDependencies[];
	devDependencies?: AvailableDependencies[];
	customDependencies?: Record<string, string>;
	customDevDependencies?: Record<string, string>;
	projectDir: string;
}) => {
	const {
		dependencies = [],
		devDependencies = [],
		customDependencies = {},
		customDevDependencies = {},
		projectDir,
	} = opts;

	const pkgJsonPath = path.join(projectDir, "package.json");

	const pkgJson = await readPackageJSON(path.dirname(pkgJsonPath));

	if (!pkgJson.dependencies) pkgJson.dependencies = {};
	if (!pkgJson.devDependencies) pkgJson.devDependencies = {};

	for (const pkgName of dependencies) {
		const version = dependencyVersionMap[pkgName];
		if (version) {
			pkgJson.dependencies[pkgName] = version;
		} else {
			console.warn(`Warning: Dependency ${pkgName} not found in version map.`);
		}
	}

	for (const pkgName of devDependencies) {
		const version = dependencyVersionMap[pkgName];
		if (version) {
			pkgJson.devDependencies[pkgName] = version;
		} else {
			console.warn(
				`Warning: Dev dependency ${pkgName} not found in version map.`,
			);
		}
	}

	for (const [pkgName, version] of Object.entries(customDependencies)) {
		pkgJson.dependencies[pkgName] = version;
	}

	for (const [pkgName, version] of Object.entries(customDevDependencies)) {
		pkgJson.devDependencies[pkgName] = version;
	}

	await writePackageJSON(path.dirname(pkgJsonPath), pkgJson);
};
