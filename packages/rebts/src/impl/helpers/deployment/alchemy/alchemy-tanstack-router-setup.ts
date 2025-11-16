import path from "@reliverse/pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import fs from "@reliverse/relifso";
import { addPackageDependency } from "../../../utils/add-package-deps";
import type { PackageManager } from "../../../types";

export async function setupTanStackRouterAlchemyDeploy(
	projectDir: string,
	_packageManager: PackageManager,
	options?: { skipAppScripts?: boolean },
) {
	const webAppDir = path.join(projectDir, "apps/web");
	if (!(await fs.pathExists(webAppDir))) return;

	await addPackageDependency({
		devDependencies: ["alchemy"],
		projectDir: webAppDir,
	});

	const pkgPath = path.join(webAppDir, "package.json");
	if (await fs.pathExists(pkgPath)) {
		const pkg = await readPackageJSON(path.dirname(pkgPath));

		if (!options?.skipAppScripts) {
			pkg.scripts = {
				...pkg.scripts,
				deploy: "alchemy deploy",
				destroy: "alchemy destroy",
			};
		}

		await writePackageJSON(path.dirname(pkgPath), pkg);
	}
}
