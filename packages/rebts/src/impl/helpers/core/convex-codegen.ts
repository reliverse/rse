import path from "@reliverse/pathkit";
import { execa } from "execa";
import { getPackageExecutionCommand } from "../../utils/package-runner";
import type { PackageManager } from "../../types";

// having problems running this in convex + better-auth
export async function runConvexCodegen(
	projectDir: string,
	packageManager: PackageManager | null | undefined,
) {
	const backendDir = path.join(projectDir, "packages/backend");
	const cmd = getPackageExecutionCommand(packageManager, "convex codegen");
	await execa(cmd, { cwd: backendDir, shell: true });
}
