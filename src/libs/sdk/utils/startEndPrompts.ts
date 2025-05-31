import { relinka } from "@reliverse/relinka";
import { readPackageJSON } from "pkg-types";

// Get package information from package.json
const pkgInfo: { name: string; version: string } = {
  name: "unknown",
  version: "0.0.0",
};

// Initialize package info
readPackageJSON()
  .then((pkg) => {
    pkgInfo.name = pkg.name || "unknown";
    pkgInfo.version = pkg.version || "0.0.0";
  })
  .catch(() => {
    // Keep default values if package.json cannot be read
    relinka("warn", "Could not read package.json, using default values");
  });

export const getPkgName = () => pkgInfo.name;
export const getPkgVersion = () => pkgInfo.version;
