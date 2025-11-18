import path from "@reliverse/dler-pathkit";
import fs from "@reliverse/dler-fs-utils";
import { PKG_ROOT } from "../constants";

export const getLatestCLIVersion = () => {
	const packageJsonPath = path.join(PKG_ROOT, "package.json");

	const packageJsonContent = fs.readJSONSync(packageJsonPath);

	return packageJsonContent.version ?? "1.0.0";
};
