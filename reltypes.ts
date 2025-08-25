// reliverse.ts types version is 2025-08-24
/**
 * Defines the configuration for building and publishing packages. This includes: versioning,
 * build settings, publishing options, libraries-dler-plugin built-in plugin, and more.
 * It customizes the build and publish pipeline for both NPM and JSR registries.
 */
export interface ReliverseConfig {
  $schema: string;
  projectName: string;
  projectAuthor: string;
  projectDescription: string;
  version: string;
  projectLicense: string;
  // ==========================================================================
  // Project configuration
  // ==========================================================================
  projectState?: string;
  projectRepository?: string;
  projectDomain?: string;
  projectCategory?: string;
  projectSubcategory?: string;
  projectTemplate?: string;
  projectTemplateDate?: string;
  projectArchitecture?: string;
  repoPrivacy?: string;
  projectGitService?: string;
  projectDeployService?: string;
  repoBranch?: string;
  // Primary tech stack/framework
  projectFramework?: string;
  projectPackageManager?: string;
  projectRuntime?: string;
  preferredLibraries?: {
    stateManagement?: string;
    formManagement?: string;
    styling?: string;
    uiComponents?: string;
    testing?: string;
    authentication?: string;
    databaseLibrary?: string;
    databaseProvider?: string;
    api?: string;
    linting?: string;
    formatting?: string;
    payment?: string;
    analytics?: string;
    monitoring?: string;
    logging?: string;
    forms?: string;
    notifications?: string;
    search?: string;
    uploads?: string;
    validation?: string;
    documentation?: string;
    icons?: string;
    mail?: string;
    cache?: string;
    storage?: string;
    cdn?: string;
    cms?: string;
    i18n?: string;
    seo?: string;
    motion?: string;
    charts?: string;
    dates?: string;
    markdown?: string;
    security?: string;
    routing?: string;
  };
  monorepo?: {
    type?: string;
    packages?: string[];
    sharedPackages?: string[];
  };
  // List dependencies to exclude from checks
  ignoreDependencies?: string[];
  // Provide custom rules for Reliverse AI
  customRules?: Record<string, any>;
  // Project features
  features?: {
    i18n?: boolean;
    analytics?: boolean;
    themeMode?: string;
    authentication?: boolean;
    api?: boolean;
    database?: boolean;
    testing?: boolean;
    docker?: boolean;
    ci?: boolean;
    commands?: string[];
    webview?: string[];
    language?: string[];
    themes?: string[];
  };
  // Code style preferences
  codeStyle?: {
    dontRemoveComments?: boolean;
    shouldAddComments?: boolean;
    typeOrInterface?: string;
    importOrRequire?: string;
    quoteMark?: string;
    semicolons?: boolean;
    lineWidth?: number;
    indentStyle?: string;
    indentSize?: number;
    importSymbol?: string;
    trailingComma?: string;
    bracketSpacing?: boolean;
    arrowParens?: string;
    tabWidth?: number;
    jsToTs?: boolean;
    cjsToEsm?: boolean;
    modernize?: {
      replaceFs?: boolean;
      replacePath?: boolean;
      replaceHttp?: boolean;
      replaceProcess?: boolean;
      replaceConsole?: boolean;
      replaceEvents?: boolean;
    };
  };
  // Settings for cloning an existing repo
  multipleRepoCloneMode?: boolean;
  customUserFocusedRepos?: string[];
  customDevsFocusedRepos?: string[];
  hideRepoSuggestions?: boolean;
  customReposOnNewProject?: boolean;
  // Set to false to disable opening the browser during env composing
  envComposerOpenBrowser?: boolean;
  // Enable auto-answering for prompts to skip manual confirmations.
  skipPromptsUseAutoBehavior?: boolean;
  // Prompt behavior for deployment
  deployBehavior?: string;
  depsBehavior?: string;
  gitBehavior?: string;
  i18nBehavior?: string;
  scriptsBehavior?: string;
  // Behavior for existing GitHub repos during project creation
  existingRepoBehavior?: string;
  // Behavior for Reliverse AI chat and agent mode
  relinterConfirm?: string;
  // ==========================================================================
  // Bump configuration
  // ==========================================================================
  /**
   * When `true`, disables version bumping.
   * Useful when retrying a failed publish with an already bumped version.
   *
   * @default false
   */
  bumpDisable: boolean;
  /**
   * Controls which files will have their version numbers updated during version bumping.
   *
   * Accepts:
   * - Standard file types like "package.json"
   * - Relative paths like "src/constants.ts"
   * - [Globbing patterns](https://github.com/mrmlnc/fast-glob#pattern-syntax)
   *
   * When empty, falls back to only updating "package.json".
   * Respects: .gitignore patterns, hidden files, .git & node_modules.
   *
   * @default ["package.json", "reliverse.ts"]
   */
  bumpFilter: string[];
  /**
   * Specifies how the version number should be incremented:
   * - `patch`: Increments the patch version for backwards-compatible bug fixes (1.2.3 → 1.2.4)
   * - `minor`: Increments the minor version for new backwards-compatible features (1.2.3 → 1.3.0)
   * - `major`: Increments the major version for breaking changes (1.2.3 → 2.0.0)
   * - `auto`: Automatically determine the appropriate bump type
   * - `manual`: Set a specific version (requires bumpSet to be set)
   *
   * Please note: `dler` infers the version from the `package.json` file.
   *
   * @default "patch"
   */
  bumpMode: BumpMode;
  /**
   * Custom version to set when bumpMode is "manual".
   * Must be a valid semver version (e.g., "1.2.3").
   *
   * @default ""
   */
  bumpSet: string;
  // ==========================================================================
  // Common configuration
  // ==========================================================================
  /**
   * When `true`, stops after building and retains distribution folders.
   * Useful for development or inspecting the build output.
   *
   * @default true
   */
  commonPubPause: boolean;
  /**
   * Specifies which package registries to publish to:
   * - `npm`: Publish only to the NPM commonPubRegistry.
   * - `jsr`: Publish only to the JSR commonPubRegistry.
   * - `npm-jsr`: Publish to both NPM and JSR registries.
   *
   * @default "npm"
   */
  commonPubRegistry: "jsr" | "npm" | "npm-jsr";
  /**
   * When `true`, enables detailed logs during the build and publish process.
   * Useful for debugging or understanding the build flow.
   *
   * @default false
   */
  commonVerbose: boolean;
  /**
   * When `true`, displays detailed build and publish logs.
   * When `false`, only shows spinner with status messages during build and publish.
   *
   * @default true
   */
  displayBuildPubLogs: boolean;
  // ==========================================================================
  // Core configuration
  // ==========================================================================
  /**
   * When `true`, generates TypeScript declaration files (.d.ts) for NPM packages.
   * Essential for providing type intranspileFormation to TypeScript users.
   *
   * To reduce bundle size you can set this to `false` if your main project
   * is planned to be used only as a global CLI tool (e.g. `bunx dler`).
   *
   * @default true
   */
  coreDeclarations: boolean;
  /**
   * Path to the project's main entry file.
   * Used as the entry point for the NPM package.
   *
   * @default "mod.ts"
   */
  coreEntryFile: string;
  /**
   * Base directory containing the source entry files.
   * All paths are resolved relative to this directory.
   * Set to `"."` if entry files are in the project root.
   *
   * @default "src"
   */
  coreEntrySrcDir: string;
  /**
   * Directory where built files will be placed within the distribution directory.
   * For example, if set to "bin", CLI scripts will be placed in "dist-npm/bin" or "dist-jsr/bin".
   *
   * @default "bin"
   */
  coreBuildOutDir: string;
  /**
   * Configuration for CLI functionality:
   * - enabled: When `true`, indicates that the package has CLI capabilities
   * - scripts: Map of CLI script names to their entry file paths
   *   The key will be used as the command name in package.json's bin field
   *   The value should be the path to the executable script (e.g. "cli.ts")
   *
   * **The source scripts should be in your "coreEntrySrcDir" directory (by default "src")**
   *
   * @example
   * {
   *   enabled: true,
   *   scripts: {
   *     "mycli": "cli.ts",
   *     "othercmd": "other-cmd.ts"
   *   }
   * }
   *
   * @default { enabled: false, scripts: {} }
   */
  coreIsCLI: {
    enabled: boolean;
    scripts: Record<string, string>;
  };
  /**
   * Optional description that overrides the description from package.json.
   * When provided, this description will be used in the dist's package.json.
   * If not provided, the description from the original package.json will be used.
   *
   * @default `package.json`'s "description"
   */
  coreDescription: string;
  // ==========================================================================
  // JSR-only config
  // ==========================================================================
  /**
   * When `true`, allows JSR publishing even with uncommitted changes.
   * Use with caution, as it may lead to inconsistent published versions.
   *
   * It is `true` by default to make it easier for new `dler` users to publish their projects.
   *
   * @default true
   */
  distJsrAllowDirty: boolean;
  /**
   * The bundler to use for creating JSR-compatible packages.
   * JSR's native bundler is recommended for best compatibility.
   *
   * @default "jsr"
   */
  distJsrBuilder: BundlerName;
  /**
   * Directory where JSR build artifacts are generated.
   * This directory will contain the package ready for JSR publishing.
   *
   * @default "dist-jsr"
   */
  distJsrDirName: string;
  /**
   * When `true`, simulates the publishing process without actually publishing.
   * Useful for testing the build and publish pipeline without side effects.
   *
   * @default false
   */
  distJsrDryRun: boolean;
  /**
   * When `true`, fails the build if warnings are detected.
   * Use with caution, as it may lead to inconsistent published versions.
   *
   * @default false
   */
  distJsrFailOnWarn: boolean;
  /**
   * When `true`, generates a `jsconfig.json` file for JSR's dist.
   *
   * @default false
   */
  distJsrGenTsconfig: boolean;
  /**
   * The file extension for output files in JSR packages.
   *
   * @default "ts"
   */
  distJsrOutFilesExt: NpmOutExt;
  /**
   * When `true`, enables JSR to process complex types, which may impact performance.
   * Enable this only if you cannot simplify or explicitly define exported types.
   *
   * JSR requires exported functions, classes, variables, and type aliases to have
   * explicitly written or easily inferred types. Otherwise, it may be unable to
   * generate documentation, type declarations for npm compatibility, or efficient
   * type checking for consumers.
   *
   * If "slow types" are present, type checking performance may degrade, and some
   * features may not work as expected.
   *
   * It is `true` by default to make it easier for new `dler` users to publish their projects.
   *
   * @see https://jsr.io/docs/about-slow-types
   * @default true
   */
  distJsrSlowTypes: boolean;
  // ==========================================================================
  // NPM-only config
  // ==========================================================================
  /**
   * The bundler to use for creating NPM-compatible packages.
   *
   * @default "mkdist"
   */
  distNpmBuilder: BundlerName;
  /**
   * Directory where NPM build artifacts are generated.
   * This directory will contain the package ready for NPM publishing.
   *
   * @default "dist-npm"
   */
  distNpmDirName: string;
  /**
   * Specifies the file extension for output files in NPM packages.
   * Determines the extension of compiled files in the NPM distribution.
   * We strongly recommend using `"js"` with the `"esm"` transpileFormat.
   *
   * @default "js"
   */
  distNpmOutFilesExt: NpmOutExt;
  // ==========================================================================
  // Libraries Dler Plugin
  // ==========================================================================
  /**
   * !! EXPERIMENTAL !!
   * Controls which parts of the project are built and published:
   * - `main-project-only`: Builds/publishes only the main package.
   * - `main-and-libs`: Builds/publishes both the main package and libraries.
   * - `libs-only`: Builds/publishes only the libraries.
   *
   * @default "main-project-only"
   */
  libsActMode: "libs-only" | "main-and-libs" | "main-project-only";
  /**
   * The directory where built libraries are stored before publishing.
   *
   * @default "dist-libs"
   */
  libsDirDist: string;
  /**
   * The directory containing library source files.
   *
   * @default "src/libs"
   */
  libsDirSrc: string;
  /**
   * !! EXPERIMENTAL !!
   * Configuration for building and publishing multiple libraries.
   * Each key represents a package name, and its value contains the configuration.
   *
   * @example
   * {
   *   "@myorg/ml1": { main: "my-lib-1/mod.ts" },
   *   "@myorg/ml2": { main: "my-lib-2/ml2-mod.ts" },
   *   "@myorg/ml3": { main: "src/libs/my-lib-3/index.js" }
   * }
   */
  libsList: Record<string, LibConfig>;
  // ==========================================================================
  // Logger setup
  // ==========================================================================
  /**
   * The name of the log file. dler uses `@reliverse/relinka` for logging.
   *
   * @default ".logs/relinka.log"
   */
  logsFileName: string;
  /**
   * When `true`, cleans up the log file from previous runs.
   *
   * @default false
   */
  logsFreshFile: boolean;
  // ==========================================================================
  // Dependency filtering
  // ==========================================================================
  /**
   * Configuration for dependency removal/injection patterns.
   * Controls which dependencies are excluded from (or injected into) the final package.
   *
   * Pattern types:
   * - Regular patterns: Exclude deps that match the pattern
   * - Negation patterns (starting with !): Don't exclude deps that match the pattern
   * - Add patterns (starting with +): Inject deps into specific dists even if original package.json doesn't have them
   *
   * Structure (dist-specific patterns are merged with global):
   * - `global`: Patterns that are always applied to all builds
   * - `dist-npm`: NPM-specific patterns
   * - `dist-jsr`: JSR-specific patterns
   * - `dist-libs`: Library-specific patterns
   *   Each library can have separate NPM and JSR patterns
   *
   * @example
   * {
   *   global: ["@types", "eslint"],
   *   "dist-npm": ["npm-specific"],
   *   "dist-jsr": ["+bun"], // Explicitly include 'bun' in JSR builds
   *   "dist-libs": {
   *     "@myorg/lib1": {
   *       npm: ["lib1-npm-specific"],
   *       jsr: ["+bun"] // Explicitly include 'bun' in this lib's JSR build
   *     }
   *   }
   * }
   */
  filterDepsPatterns: {
    global: string[];
    "dist-npm": string[];
    "dist-jsr": string[];
    "dist-libs": Record<
      string,
      {
        npm: string[];
        jsr: string[];
      }
    >;
  };
  // ==========================================================================
  // Code quality tools
  // ==========================================================================
  /**
   * List of tools to run before the build process starts.
   * Available options: "tsc", "eslint", "biome", "knip", "dler-check"
   * Each tool will only run if it's installed in the system.
   *
   * @default []
   */
  runBeforeBuild: ("tsc" | "eslint" | "biome" | "knip" | "dler-check")[];
  /**
   * List of tools to run after the build process completes.
   * Available options: "dler-check"
   * Each tool will only run if it's installed in the system.
   *
   * @default []
   */
  runAfterBuild: "dler-check"[];
  // ==========================================================================
  // Build hooks
  // ==========================================================================
  /**
   * Array of functions to be executed before the build process starts.
   * These hooks will be called in sequence before any build steps.
   *
   * If you are a dler plugin developer, tell your users to
   * call your plugin's `beforeBuild`-related function here.
   *
   * @example
   * hooksBeforeBuild: [
   *   async () => {
   *     // Custom pre-build logic
   *     await someAsyncOperation();
   *
   *     // dler-plugin-my-plugin-name
   *     await myPluginName_beforeBuild();
   *   }
   * ]
   *
   * @default []
   */
  hooksBeforeBuild: (() => Promise<void>)[];
  /**
   * Array of functions to be executed after the build process completes.
   * These hooks will be called in sequence after all build steps.
   *
   * If you are a dler plugin developer, tell your users to
   * call your plugin's `afterBuild`-related function here.
   *
   * @example
   * hooksAfterBuild: [
   *   async () => {
   *     // Custom post-build logic
   *     await someAsyncOperation();
   *
   *     // dler-plugin-my-plugin-name
   *     await myPluginName_afterBuild();
   *   }
   * ]
   *
   * @default []
   */
  hooksAfterBuild: (() => Promise<void>)[];
  /**
   * When `true`, cleans up the temporary directories after the build process completes.
   *
   * @default true
   */
  postBuildSettings: {
    deleteDistTmpAfterBuild: boolean;
  };
  // ==========================================================================
  // Build setup
  // ==========================================================================
  /**
   * When `true`, fails the build if warnings are detected.
   * Use with caution, as it may lead to inconsistent published versions.
   *
   * @default false
   */
  transpileFailOnWarn: boolean;
  /**
   * The transpileTarget runtime environment for the built package.
   *
   * @default "es2023"
   */
  transpileEsbuild: Esbuild;
  /**
   * Output module transpileFormat for built files:
   * - `esm`: ECMAScript modules (import/export)
   * - `cjs`: CommonJS modules (require/exports)
   * - `iife`: Immediately Invoked Function Expression (for browsers)
   *
   * @default "esm"
   */
  transpileFormat: transpileFormat;
  /**
   * When `true`, minifies the output to reduce bundle size.
   * Recommended for production builds but may increase build time.
   *
   * @default true
   */
  transpileMinify: boolean;
  /**
   * The base URL for loading assets in the built package.
   * Important for packages that include assets like images or fonts.
   *
   * @default "/"
   */
  transpilePublicPath: string;
  /**
   * Controls source map generation for debugging (experimental):
   * - `true/false`: Enable/disable source maps.
   * - `"inline"`: Include source maps within output files.
   * - `"none"`: Do not generate source maps.
   * - `"linked"`: Generate separate source map files with links.
   * - `"external"`: Generate separate source map files.
   *
   * @default false
   */
  transpileSourcemap: Sourcemap;
  /**
   * When `true`, enables code transpileSplitting for improved load-time performance.
   * Useful for large applications but may not be needed for small projects.
   *
   * @default false
   */
  transpileSplitting: boolean;
  /**
   * Stub the package for JIT compilation.
   *
   * @default false
   */
  transpileStub: boolean;
  /**
   * Defines the transpileTarget runtime environment:
   * - `node`: Optimized for Node.js.
   * - `bun`: Optimized for Bun.
   * - `browser`: Optimized for web browsers.
   *
   * @default "node"
   */
  transpileTarget: transpileTarget;
  /**
   * Watch the src dir and rebuild on change (experimental).
   *
   * @default false
   */
  transpileWatch: boolean;
  /**
   * Specifies what resources to send to npm and jsr registries.
   * coreBuildOutDir (e.g. "bin") dir is automatically included.
   * The following is also included if publishArtifacts is {}:
   * - global: ["package.json", "README.md", "LICENSE"]
   * - dist-jsr,dist-libs/jsr: ["jsr.json"]
   *
   * Structure:
   * - `global`: Files to include in all distributions
   * - `dist-jsr`: Files specific to JSR distribution
   * - `dist-npm`: Files specific to NPM distribution
   * - `dist-libs`: Library-specific files for each distribution type
   *
   * Useful for including additional files like configuration or documentation.
   * Pro tip: set jsr.jsonc to generate jsr.jsonc instead of jsr.json config.
   *
   * @default
   * {
   *   global: ["bin", "package.json", "README.md", "LICENSE"],
   *   "dist-jsr": ["jsr.json"],
   *   "dist-npm": [],
   *   "dist-libs": {
   *     "@myorg/lib1": {
   *       jsr: ["jsr.json"],
   *       npm: []
   *     }
   *   }
   * }
   */
  publishArtifacts?: {
    global: string[];
    "dist-jsr": string[];
    "dist-npm": string[];
    "dist-libs": Record<
      string,
      {
        jsr: string[];
        npm: string[];
      }
    >;
  };
  // Files with these extensions will be built
  // Any other files will be copied as-is to dist
  /**
   * File extensions that should be copied to temporary build directories during pre-build.
   * These files will be processed by the bundlers.
   * All other files will be copied as-is to final dist directories during post-build.
   * @default ["ts", "js"]
   */
  buildPreExtensions: string[];
  // If you need to exclude some ts/js files from being built,
  // you can store them in the dirs with buildTemplatesDir name
  /**
   * Directory name for templates that should be excluded from pre-build processing.
   * Files in this directory will be copied as-is during post-build.
   * @default "templates"
   */
  buildTemplatesDir: string;
  // ==========================================================================
  // Relinka Logger Configuration
  // ==========================================================================
  /**
   * Integrated relinka logger configuration.
   * @see https://github.com/reliverse/relinka
   *
   * @default See DEFAULT_RELINKA_CONFIG in defaults
   */
  relinka: RelinkaConfig;
  // ==========================================================================
  // Remdn Configuration
  // ==========================================================================
  /**
   * Configuration for the remdn command which generates directory comparison documentation.
   * Controls how files are compared and documented across different distribution directories.
   */
  remdn?: {
    /**
     * Title for the generated documentation.
     * @default "Directory Comparison"
     */
    title?: string;
    /**
     * Output path for the generated HTML file.
     * @default "docs/files.html"
     */
    output?: string;
    /**
     * Configuration for directories to compare.
     * Each key represents a directory path, and its value contains directory-specific settings.
     */
    dirs?: Record<string, Record<string, never>>;
    /**
     * Extension mapping for file comparison.
     * Maps source file extensions to their corresponding extensions in different distribution directories.
     * Format: [<main>, <dist-npm/bin | dist-libs's * npm/bin>, <dist-jsr | dist-libs's * jsr/bin>]
     */
    "ext-map"?: Record<string, string[]>;
  };
}
export type BumpMode = "patch" | "minor" | "major" | "auto" | "manual";
/**
 * Supported bundler names for building packages:
 * - bun: Bun's built-in bundler for fast builds
 * - copy: A simple file copy without bundling
 * - jsr: Similar to copy but optimized for the JSR commonPubRegistry
 * - mkdist: A lightweight bundler focused on TypeScript/ESM
 * - rollup: A traditional bundler with an extensive plugin ecosystem
 * - untyped: Types and markdown generation from a config object
 */
export type BundlerName = "bun" | "copy" | "jsr" | "mkdist" | "rollup" | "untyped";
export type NpmOutExt = "cjs" | "cts" | "js" | "mjs" | "mts" | "ts";
/**
 * Configuration for a library to be built and published as a separate package.
 * Used when publishing multiple packages from a single repository.
 */
export interface LibConfig {
  /**
   * When `true`, generates TypeScript declaration files (.d.ts) for NPM packages.
   */
  libDeclarations: boolean;
  /**
   * An optional description of the library, included in the dist's package.json.
   * Provides users with an overview of the library's purpose.
   *
   * @example "Utility functions for data manipulation"
   * @example "Core configuration module for the framework"
   *
   * @default `package.json`'s "description"
   */
  libDescription: string;
  /**
   * The directory where the library's dist files are stored.
   *
   * @default name is derived from the library's name after slash
   */
  libDirName: string;
  /**
   * The path to the library's main entry file.
   * This file serves as the primary entry point for imports.
   * The path should be relative to the project root.
   * The full path to the library's main file is derived by joining `libsDirDist` with `main`.
   *
   * @example "my-lib-1/mod.ts"
   * @example "my-lib-2/ml2-mod.ts"
   * @example "src/libs/my-lib-3/index.js"
   */
  libMainFile: string;
  /**
   * Dependencies to include in the dist's package.json.
   * The final output may vary based on `filterDepsPatterns`.
   * Defines how dependencies are handled during publishing:
   * - `string[]`: Includes only the specified dependencies.
   * - `true`: Includes all dependencies from the main package.json.
   * - `false` or `undefined`: Automatically determines dependencies based on imports.
   *
   * @example ["@reliverse/pathkit", "@reliverse/relifso"] - Only will include these specific dependencies.
   * @example true - Include all `dependencies` from the main package.json.
   */
  libPkgKeepDeps: boolean | string[];
  /**
   * When `true`, minifies the output to reduce bundle size.
   * Recommended for production builds but may increase build time.
   *
   * @default true
   */
  libTranspileMinify: boolean;
  /**
   * When true, pauses publishing for this specific library (overridden by commonPubPause).
   * If true, this library will be built but not published, even if other libs are published.
   *
   * @default false
   */
  libPubPause?: boolean;
  /**
   * The registry to publish the library to.
   *
   * @default "npm"
   */
  libPubRegistry?: "jsr" | "npm" | "npm-jsr";
  /**
   * Optional version override for the library.
   * If not provided, falls back to the version from the main package.json.
   *
   * @default `package.json`'s "version"
   */
  version?: string;
}
export type Esbuild = "es2019" | "es2020" | "es2021" | "es2022" | "es2023";
/**
 * Supported output module transpileFormats for built packages.
 * - esm: ECMAScript modules (import/export)
 * - cjs: CommonJS modules (require/exports)
 * - iife: Immediately Invoked Function Expression (for browsers)
 */
export type transpileFormat = "cjs" | "esm" | "iife";
/**
 * Supported source map options for built packages.
 * - boolean: Enable/disable source maps.
 * - "inline": Include source maps within output files.
 * - "none": Do not generate source maps.
 * - "linked": Generate separate source map files with links.
 * - "external": Generate separate source map files.
 */
export type Sourcemap = "external" | "inline" | "linked" | "none" | boolean;
/**
 * Supported transpileTarget runtime environments for built packages.
 * - node: Optimized for Node.js.
 * - bun: Optimized for Bun.
 * - browser: Optimized for web browsers.
 */
export type transpileTarget = "browser" | "bun" | "node";
/** Configuration for directory-related settings. */
export type RelinkaDirsConfig = {
  maxLogFiles?: number;
};
/** Log level types used by the logger. */
export type LogLevel =
  | "error"
  | "fatal"
  | "info"
  | "success"
  | "verbose"
  | "warn"
  | "log"
  | "internal"
  | "null"
  | "step"
  | "box"
  | "message";
/** Configuration for a single log level. */
export type LogLevelConfig = {
  /**
   * Symbol to display for this log level.
   * @see https://symbl.cc
   */
  symbol: string;
  /**
   * Fallback symbol to use if Unicode is not supported.
   */
  fallbackSymbol: string;
  /**
   * Color to use for this log level.
   */
  color: string;
  /**
   * Number of spaces after the symbol/fallback
   */
  spacing?: number;
};
/** Configuration for all log levels. */
export type LogLevelsConfig = Partial<Record<LogLevel, LogLevelConfig>>;
/**
 * Configuration options for the Relinka logger.
 * All properties are optional to allow for partial configuration.
 * Defaults will be applied during initialization.
 */
export type RelinkaConfig = {
  /**
   * Enables verbose (aka debug) mode for detailed logging.
   *
   * `true` here works only for end-users of CLIs/libs when theirs developers
   * has been awaited for user's config via `@reliverse/relinka`'s `await relinkaConfig;`
   */
  verbose?: boolean;
  /**
   * Configuration for directory-related settings.
   * - `maxLogFiles`: The maximum number of log files to keep before cleanup.
   */
  dirs?: RelinkaDirsConfig;
  /**
   * Disables color output in the console.
   */
  disableColors?: boolean;
  /**
   * Configuration for log file output.
   */
  logFile?: {
    /**
     * Path to the log file.
     */
    outputPath?: string;
    /**
     * How to handle date in the filename.
     * - `disable`: No date prefix/suffix
     * - `append-before`: Add date before the filename (e.g., "2024-01-15-log.txt")
     * - `append-after`: Add date after the filename (e.g., "log-2024-01-15.txt")
     */
    nameWithDate?: "disable" | "append-before" | "append-after";
    /**
     * If true, clears the log file when relinkaConfig is executed with supportFreshLogFile: true.
     * This is useful for starting with a clean log file on each run.
     */
    freshLogFile?: boolean;
  };
  /**
   * If true, logs will be saved to a file.
   */
  saveLogsToFile?: boolean;
  /**
   * Configuration for timestamp in log messages.
   */
  timestamp?: {
    /**
     * If true, timestamps will be added to log messages.
     */
    enabled: boolean;
    /**
     * The format for timestamps. Default is YYYY-MM-DD HH:mm:ss.SSS
     */
    format?: string;
  };
  /**
   * Allows to customize the log levels.
   */
  levels?: LogLevelsConfig;
  /**
   * Controls how often the log cleanup runs (in milliseconds)
   * Default: 10000 (10 seconds)
   */
  cleanupInterval?: number;
  /**
   * Maximum size of the log write buffer before flushing to disk (in bytes)
   * Default: 4096 (4KB)
   */
  bufferSize?: number;
  /**
   * Maximum time to hold logs in buffer before flushing to disk (in milliseconds)
   * Default: 5000 (5 seconds)
   */
  maxBufferAge?: number;
};
/**
 * Default configuration for the build and publish logic.
 */
export const DEFAULT_CONFIG_RELIVERSE: ReliverseConfig = {
  $schema: "./schema.json",
  projectName: "",
  projectAuthor: "",
  projectDescription: "",
  version: "",
  projectLicense: "",
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "patch",
  bumpSet: "",
  commonPubPause: true,
  commonPubRegistry: "npm",
  commonVerbose: false,
  displayBuildPubLogs: true,
  coreDeclarations: true,
  coreDescription: "",
  coreEntryFile: "mod.ts",
  coreEntrySrcDir: "src",
  coreBuildOutDir: "bin",
  coreIsCLI: { enabled: false, scripts: {} },
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrFailOnWarn: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,
  distNpmBuilder: "mkdist",
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",
  libsActMode: "main-project-only",
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {},
  logsFileName: ".logs/relinka.log",
  logsFreshFile: true,
  // Dependency filtering
  filterDepsPatterns: {
    global: ["@types", "biome", "eslint", "knip", "prettier", "typescript", "@reliverse/dler"],
    "dist-npm": [],
    "dist-jsr": [],
    "dist-libs": {},
  },
  // Code quality tools
  runBeforeBuild: [], // tsc, eslint, biome, knip, dler-check
  runAfterBuild: [], // dler-check
  // Build hooks
  hooksBeforeBuild: [
    // async () => {
    //   await someAsyncOperation();
    // }
  ],
  hooksAfterBuild: [
    // async () => {
    //   await someAsyncOperation();
    // }
  ],
  postBuildSettings: {
    deleteDistTmpAfterBuild: true,
  },
  // Build setup
  transpileFailOnWarn: false,
  transpileEsbuild: "es2023",
  transpileFormat: "esm",
  transpileMinify: true,
  transpilePublicPath: "/",
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  transpileTarget: "node",
  transpileWatch: false,
  // Publish artifacts configuration
  publishArtifacts: {
    global: ["package.json", "README.md", "LICENSE"],
    "dist-jsr": [],
    "dist-npm": [],
    "dist-libs": {},
  },
  // Files with these extensions will be built
  // Any other files will be copied as-is to dist
  buildPreExtensions: ["ts", "js"],
  // If you need to exclude some ts/js files from being built,
  // you can store them in the dirs with buildTemplatesDir name
  buildTemplatesDir: "templates",
  // Integrated relinka logger configuration
  relinka: {
    verbose: false,
    dirs: {
      maxLogFiles: 5,
    },
    disableColors: false,
    logFile: {
      outputPath: "logs.log",
      nameWithDate: "disable",
      freshLogFile: true,
    },
    saveLogsToFile: true,
    timestamp: {
      enabled: false,
      format: "HH:mm:ss",
    },
    cleanupInterval: 10_000, // 10 seconds
    bufferSize: 4096, // 4KB
    maxBufferAge: 5000, // 5 seconds
    levels: {
      success: {
        symbol: "✓",
        fallbackSymbol: "[OK]",
        color: "greenBright",
        spacing: 3,
      },
      info: {
        symbol: "i",
        fallbackSymbol: "[i]",
        color: "cyanBright",
        spacing: 3,
      },
      error: {
        symbol: "✖",
        fallbackSymbol: "[ERR]",
        color: "redBright",
        spacing: 3,
      },
      warn: {
        symbol: "⚠",
        fallbackSymbol: "[WARN]",
        color: "yellowBright",
        spacing: 3,
      },
      fatal: {
        symbol: "‼",
        fallbackSymbol: "[FATAL]",
        color: "redBright",
        spacing: 3,
      },
      verbose: {
        symbol: "✧",
        fallbackSymbol: "[VERBOSE]",
        color: "gray",
        spacing: 3,
      },
      internal: {
        symbol: "⚙",
        fallbackSymbol: "[INTERNAL]",
        color: "magentaBright",
        spacing: 3,
      },
      log: { symbol: "│", fallbackSymbol: "|", color: "dim", spacing: 3 },
      message: {
        symbol: "🞠",
        fallbackSymbol: "[MSG]",
        color: "cyan",
        spacing: 3,
      },
    },
  },
  // Remdn Configuration
  remdn: {
    title: "Directory Comparison",
    output: "docs/files.html",
    dirs: {
      src: {},
      "dist-npm/bin": {},
      "dist-jsr/bin": {},
      "dist-libs/sdk/npm/bin": {},
    },
    "ext-map": {
      ts: ["ts", "js-d.ts", "ts"], // [<main>, <dist-npm/bin | dist-libs's * npm/bin>, <dist-jsr | dist-libs's * jsr/bin>]
    },
  },
};
export const defineConfig = (userConfig: Partial<ReliverseConfig> = {}) => {
  return { ...DEFAULT_CONFIG_RELIVERSE, ...userConfig };
};
