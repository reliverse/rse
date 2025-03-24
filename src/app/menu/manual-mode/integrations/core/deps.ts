import fs from "fs-extra";
import path from "pathe";

/**
 * Checks if deps exist in package.json but node_modules is missing.
 * Returns an object with flags about missing deps and whether any exist at all.
 */
export async function checkMissingDependencies(
  cwd: string,
  requiredContent: Record<string, boolean>,
  optionalContent: Record<string, boolean>,
): Promise<{ depsMissing: boolean; hasAnyDeps: boolean }> {
  // Convert possibly undefined values to boolean
  const hasFilePackageJson = !!requiredContent.filePackageJson;
  const hasNodeModules = !!optionalContent.dirNodeModules;

  // "missing deps" means we have a package.json but node_modules is absent
  const hasMissingDeps = !hasNodeModules && hasFilePackageJson;

  // Check if package.json actually has dependencies
  let hasAnyDeps = false;
  if (hasFilePackageJson) {
    try {
      const pkgJson = await fs.readJSON(path.join(cwd, "package.json"));
      const depCount =
        Object.keys(pkgJson.dependencies || {}).length +
        Object.keys(pkgJson.devDependencies || {}).length;
      hasAnyDeps = depCount > 0;
    } catch {
      // If reading fails, assume no deps
      hasAnyDeps = false;
    }
  }

  // If node_modules is missing and package.json has dependencies, mark as depsMissing
  const depsMissing = hasMissingDeps && hasAnyDeps;
  return { depsMissing, hasAnyDeps };
}
