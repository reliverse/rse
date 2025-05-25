import { defineConfig } from "@reliverse/dler";

/**
 * Reliverse Bundler Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/dler
 */
export default defineConfig({
  // Bump configuration
  bumpDisable: true,
  bumpFilter: ["package.json", ".config/rse.ts"],
  bumpMode: "patch",

  // Common configuration
  commonPubPause: true,
  commonPubRegistry: "npm", // TODO: switch to "npm-jsr" when `libPubRegistry` is implemented (in @reliverse/dler)
  commonVerbose: false,

  // Core configuration
  coreDeclarations: true,
  coreDescription:
    "rse (prev. reliverse cli) all-in-one companion for building and improving web projects — whether you're kicking off something new or upgrading an existing app. It's like having a little AI-powered toolbox in your terminal, ready to help with coding, refactoring, image gen, and more.",
  coreEntryFile: "mod.ts",
  coreEntrySrcDir: "src",
  coreBuildOutDir: "bin",
  coreIsCLI: { enabled: true, scripts: { dler: "cli.ts" } },

  // JSR-only config
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrCopyRootFiles: ["README.md", "LICENSE"],
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrFailOnWarn: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,

  // NPM-only config
  distNpmBuilder: "mkdist",
  distNpmCopyRootFiles: ["README.md", "LICENSE"],
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",

  // Libraries Dler Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "main-and-libs",
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {
    "@reliverse/rse-sdk": {
      libDeclarations: true,
      libDescription:
        "@reliverse/rse-sdk allows you to create new rse CLI plugins, interact with reliverse.org, and even extend your own CLI functionality (you may also try @reliverse/dler-sdk for this case).",
      libDirName: "sdk",
      libMainFile: "sdk/sdk-mod.ts",
      libPkgKeepDeps: true,
      libTranspileMinify: true,
      libPubPause: false,
    },
  },

  // Logger setup
  logsFileName: "logs/relinka.log",
  logsFreshFile: true,

  // Dependency filtering
  // Global is always applied
  removeDepsPatterns: {
    global: [
      "@types",
      "biome",
      "eslint",
      "knip",
      "prettier",
      "typescript",
      "@reliverse/dler",
    ],
    "dist-npm": ["bun"],
    "dist-jsr": [],
    "dist-libs": {},
  },

  // Build setup
  transpileEsbuild: "es2023",
  transpileFormat: "esm",
  transpileMinify: true,
  transpilePublicPath: "/",
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  transpileTarget: "node",
  transpileWatch: false,
});
