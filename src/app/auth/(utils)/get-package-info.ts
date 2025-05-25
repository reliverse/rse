import path from "path";
import fs from "@reliverse/relifso";

export function getPackageInfo(cwd?: string) {
  const packageJsonPath = cwd
    ? path.join(cwd, "package.json")
    : path.join("package.json");
  try {
    return fs.readJSONSync(packageJsonPath);
  } catch (error) {
    throw error;
  }
}
