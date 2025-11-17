import path from "@reliverse/pathkit";
import { readPackageJSON, writePackageJSON } from "@reliverse/dler-pkg-tsc";
import fs from "@reliverse/relifso";
import { addPackageDependency } from "../../../utils/add-package-deps";
import type { PackageManager } from "../../../types";

export async function setupNextAlchemyDeploy(
	projectDir: string,
	_packageManager: PackageManager,
	options?: { skipAppScripts?: boolean },
) {
	const webAppDir = path.join(projectDir, "apps/web");
	if (!(await fs.pathExists(webAppDir))) return;

	await addPackageDependency({
		dependencies: ["@opennextjs/cloudflare"],
		devDependencies: ["alchemy", "wrangler", "@cloudflare/workers-types"],
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

	const openNextConfigPath = path.join(webAppDir, "open-next.config.ts");
	const openNextConfigContent = `
export default defineCloudflareConfig({});
`;

	await fs.writeFile(openNextConfigPath, openNextConfigContent);

	const gitignorePath = path.join(webAppDir, ".gitignore");
	if (await fs.pathExists(gitignorePath)) {
		const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
		if (!gitignoreContent.includes("wrangler.jsonc")) {
			await fs.appendFile(gitignorePath, "\nwrangler.jsonc\n");
		}
	} else {
		await fs.writeFile(gitignorePath, "wrangler.jsonc\n");
	}
}
