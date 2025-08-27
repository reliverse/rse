// reliverse.ts types version 2025-08-26 (this file is generated, don't edit it)
export interface ReliverseConfig {
  $schema?: string;
  projectName?: UnknownLiteral | (string & {});
  projectAuthor?: UnknownLiteral | (string & {});
  projectDescription?: string;
  version?: string;
  projectLicense?: string;
  projectRepository?: string;
  projectDomain?: string;
  projectGitService?: ProjectGitService;
  projectDeployService?: ProjectDeployService;
  projectPackageManager?: ProjectPackageManager;
  projectState?: ProjectState;
  projectCategory?: ProjectCategory;
  projectSubcategory?: ProjectSubcategory;
  projectFramework?: ProjectFramework;
  projectTemplate?: ProjectTemplate;
  projectTemplateDate?: string;
  features?: {
    i18n?: boolean;
    analytics?: boolean;
    themeMode?: ThemeMode;
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
  preferredLibraries?: {
    stateManagement?: PreferredStateManagement;
    formManagement?: PreferredForm;
    styling?: PreferredStyling;
    uiComponents?: PreferredUI;
    testing?: PreferredTesting;
    authentication?: PreferredAuth;
    databaseLibrary?: PreferredDBLib;
    databaseProvider?: PreferredDBProvider;
    api?: PreferredAPI;
    linting?: PreferredLint;
    formatting?: PreferredFormat;
    payment?: PreferredPayment;
    analytics?: PreferredAnalytics;
    monitoring?: PreferredMonitoring;
    logging?: PreferredLogging;
    forms?: PreferredForms;
    notifications?: PreferredNotifications;
    search?: PreferredSearch;
    uploads?: PreferredUploads;
    validation?: PreferredValidation;
    documentation?: PreferredDocs;
    icons?: PreferredIcons;
    mail?: PreferredMail;
    cache?: PreferredCache;
    storage?: PreferredStorage;
    cdn?: PreferredCDN;
    cms?: PreferredCMS;
    i18n?: PreferredI18n;
    seo?: PreferredSEO;
    motion?: PreferredMotion;
    charts?: PreferredCharts;
    dates?: PreferredDates;
    markdown?: PreferredMarkdown;
    security?: PreferredSecurity;
    routing?: PreferredRouting;
  };
  codeStyle?: {
    lineWidth?: number;
    indentSize?: number;
    indentStyle?: "space" | "tab";
    quoteMark?: "single" | "double";
    semicolons?: boolean;
    trailingCommas?: "none" | "es5" | "all";
    bracketSpacing?: boolean;
    arrowParens?: "always" | "avoid";
    tabWidth?: number;
    jsToTs?: boolean;
    dontRemoveComments?: boolean;
    shouldAddComments?: boolean;
    typeOrInterface?: "type" | "interface" | "mixed";
    importOrRequire?: "import" | "require" | "mixed";
    cjsToEsm?: boolean;
    modernize?: {
      replaceFs?: boolean;
      replacePath?: boolean;
      replaceHttp?: boolean;
      replaceProcess?: boolean;
      replaceConsole?: boolean;
      replaceEvents?: boolean;
    };
    importSymbol?: string;
  };
  monorepo?: {
    type?: "none" | "turborepo" | "nx" | "pnpm" | "bun";
    packages?: string[];
    sharedPackages?: string[];
  };
  ignoreDependencies?: string[];
  customRules?: Record<string, unknown>;
  multipleRepoCloneMode?: boolean;
  customUserFocusedRepos?: string[];
  customDevsFocusedRepos?: string[];
  hideRepoSuggestions?: boolean;
  customReposOnNewProject?: boolean;
  envComposerOpenBrowser?: boolean;
  repoBranch?: string;
  repoPrivacy?: RepoPrivacy;
  projectArchitecture?: ProjectArchitecture;
  projectRuntime?: ProjectRuntime;
  skipPromptsUseAutoBehavior?: boolean;
  deployBehavior?: "prompt" | "autoYes" | "autoNo";
  depsBehavior?: "prompt" | "autoYes" | "autoNo";
  gitBehavior?: "prompt" | "autoYes" | "autoNo";
  i18nBehavior?: "prompt" | "autoYes" | "autoNo";
  scriptsBehavior?: "prompt" | "autoYes" | "autoNo";
  existingRepoBehavior?: "prompt" | "autoYes" | "autoYesSkipCommit" | "autoNo";
  relinterConfirm?: RelinterConfirm;
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
  // Binary Build Configuration
  // ==========================================================================
  /**
   * When `true`, enables binary build functionality to create standalone executables.
   *
   * @default false
   */
  binaryBuildEnabled: boolean;
  /**
   * Input TypeScript file to bundle for binary builds.
   * If not specified, will use the coreEntryFile from the coreEntrySrcDir.
   *
   * @default undefined (uses coreEntryFile)
   */
  binaryBuildInputFile?: string;
  /**
   * Comma-separated list of targets to build for binary builds.
   * Use 'all' for all targets, 'list' to show available targets.
   * Target format is {prefix}-{platform}-{arch} where prefix is extracted from input filename.
   * Platforms: linux, windows, darwin (macOS)
   * Architectures: x64, arm64
   * Examples: dler-linux-x64, dler-windows-arm64, dler-darwin-x64
   *
   * @default "all"
   */
  binaryBuildTargets: string;
  /**
   * Output directory for built binary executables.
   *
   * @default "dist"
   */
  binaryBuildOutDir: string;
  /**
   * When `true`, minifies the binary output.
   *
   * @default true
   */
  binaryBuildMinify: boolean;
  /**
   * When `true`, generates source maps for binary builds.
   *
   * @default true
   */
  binaryBuildSourcemap: boolean;
  /**
   * When `true`, enables bytecode compilation for faster startup (Bun v1.1.30+).
   *
   * @default false
   */
  binaryBuildBytecode: boolean;
  /**
   * When `true`, cleans output directory before building binaries.
   *
   * @default true
   */
  binaryBuildClean: boolean;
  /**
   * Path to Windows .ico file for executable icon.
   *
   * @default undefined
   */
  binaryBuildWindowsIcon?: string;
  /**
   * When `true`, hides console window on Windows.
   *
   * @default false
   */
  binaryBuildWindowsHideConsole: boolean;
  /**
   * Asset naming pattern for binary builds.
   *
   * @default "[name]-[hash].[ext]"
   */
  binaryBuildAssetNaming: string;
  /**
   * When `true`, builds binary targets in parallel.
   *
   * @default true
   */
  binaryBuildParallel: boolean;
  /**
   * External dependencies to exclude from binary bundle.
   *
   * @default ["c12", "terminal-kit"]
   */
  binaryBuildExternal: string[];
  /**
   * When `true`, creates a bundled script instead of standalone executable.
   * Useful for debugging terminal issues.
   *
   * @default false
   */
  binaryBuildNoCompile: boolean;
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
  transpileTarget: TranspileTarget;
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
  relinka: {
    /**
     * Configuration options for the Relinka logger.
     * All properties are optional to allow for partial configuration.
     * Defaults will be applied during initialization.
     */
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
/** Configuration for directory-related settings. */
export interface RelinkaDirsConfig {
  maxLogFiles?: number;
}
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
export interface LogLevelConfig {
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
}
/** Configuration for all log levels. */
export type LogLevelsConfig = Partial<Record<LogLevel, LogLevelConfig>>;
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
export type TranspileTarget = "browser" | "bun" | "node";
export type UnknownLiteral = "unknown";
export type ProjectState = "creating" | "created";
export type ProjectCategory =
  | UnknownLiteral
  | "website"
  | "vscode"
  | "browser"
  | "cli"
  | "library"
  | "mobile";
export type ProjectSubcategory = UnknownLiteral | "e-commerce" | "tool";
export type ProjectFramework =
  | UnknownLiteral
  | "nextjs"
  | "vite"
  | "svelte"
  | "remix"
  | "astro"
  | "nuxt"
  | "solid"
  | "qwik"
  | "vue"
  | "wxt"
  | "lynx"
  | "react-native"
  | "expo"
  | "capacitor"
  | "ionic"
  | "electron"
  | "tauri"
  | "neutralino"
  | "rempts"
  | "citty"
  | "commander"
  | "cac"
  | "meow"
  | "yargs"
  | "vscode"
  | "webextension"
  | "browser-extension"
  | "npm-jsr";
export type ProjectTemplate =
  | UnknownLiteral
  | "blefnk/relivator-nextjs-template"
  | "blefnk/relivator-docker-template"
  | "blefnk/next-react-ts-src-minimal"
  | "blefnk/all-in-one-nextjs-template"
  | "blefnk/create-t3-app"
  | "blefnk/create-next-app"
  | "blefnk/astro-starlight-template"
  | "blefnk/versator-nextjs-template"
  | "blefnk/relivator-lynxjs-template"
  | "blefnk/relivator-react-native-template"
  | "reliverse/template-browser-extension"
  | "microsoft/vscode-extension-samples"
  | "microsoft/vscode-extension-template"
  | "rsetarter-template"
  | "blefnk/deno-cli-tutorial";
export type RepoPrivacy = UnknownLiteral | "public" | "private";
export type ProjectArchitecture = UnknownLiteral | "fullstack" | "separated";
export type ProjectRuntime = "node" | "deno" | "bun";
export type ProjectPackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type ProjectGitService = "github" | "gitlab" | "bitbucket" | "none";
export type ProjectDeployService = "vercel" | "netlify" | "railway" | "deno" | "none";
export type ThemeMode = "light" | "dark" | "dark-light";
export type PreferredStateManagement = "zustand" | "jotai" | "redux-toolkit" | UnknownLiteral;
export type PreferredForm = "react-hook-form" | "formik" | UnknownLiteral;
export type PreferredStyling =
  | "tailwind"
  | "styled-components"
  | "css-modules"
  | "sass"
  | UnknownLiteral;
export type PreferredUI = "shadcn-ui" | "chakra-ui" | "material-ui" | UnknownLiteral;
export type PreferredTesting =
  | "bun"
  | "vitest"
  | "jest"
  | "playwright"
  | "cypress"
  | UnknownLiteral;
export type PreferredAuth =
  | "better-auth"
  | "clerk"
  | "next-auth"
  | "supabase-auth"
  | "auth0"
  | UnknownLiteral;
export type PreferredDBLib = "drizzle" | "prisma" | "supabase" | UnknownLiteral;
export type PreferredDBProvider = "pg" | "mysql" | "sqlite" | "mongodb" | UnknownLiteral;
export type PreferredAPI = "hono" | "trpc" | "graphql" | "rest" | UnknownLiteral;
export type PreferredLint = "eslint" | UnknownLiteral;
export type PreferredFormat = "biome" | UnknownLiteral;
export type PreferredPayment = "stripe" | UnknownLiteral;
export type PreferredAnalytics = "vercel" | UnknownLiteral;
export type PreferredMonitoring = "sentry" | UnknownLiteral;
export type PreferredLogging = "axiom" | UnknownLiteral;
export type PreferredForms = "react-hook-form" | UnknownLiteral;
export type PreferredNotifications = "sonner" | UnknownLiteral;
export type PreferredSearch = "algolia" | UnknownLiteral;
export type PreferredUploads = "uploadthing" | UnknownLiteral;
export type PreferredValidation = "zod" | "typebox" | "valibot" | UnknownLiteral;
export type PreferredDocs = "starlight" | "nextra" | UnknownLiteral;
export type PreferredIcons = "lucide" | UnknownLiteral;
export type PreferredMail = "resend" | UnknownLiteral;
export type PreferredCache = "redis" | UnknownLiteral;
export type PreferredStorage = "cloudflare" | UnknownLiteral;
export type PreferredCDN = "cloudflare" | UnknownLiteral;
export type PreferredCMS = "contentlayer" | UnknownLiteral;
export type PreferredI18n = "next-intl" | UnknownLiteral;
export type PreferredSEO = "next-seo" | UnknownLiteral;
export type PreferredMotion = "framer" | UnknownLiteral;
export type PreferredCharts = "recharts" | UnknownLiteral;
export type PreferredDates = "dayjs" | UnknownLiteral;
export type PreferredMarkdown = "mdx" | UnknownLiteral;
export type PreferredSecurity = "auth" | UnknownLiteral;
export type PreferredRouting = "next" | "react-router" | "tanstack-router" | UnknownLiteral;
export type RelinterConfirm = "promptOnce" | "promptEachFile" | "autoYes";
/**
 * Default configuration for the build and publish logic.
 */
export const DEFAULT_CONFIG_RELIVERSE: ReliverseConfig = {
  // RSE CONFIG (https://docs.reliverse.org/cli)
  // Restart the CLI to apply your config changes
  $schema: "./schema.json",
  // General project information
  projectName: "@reliverse/dler",
  projectAuthor: "reliverse",
  projectDescription:
    "dler (prev. relidler) is a flexible, unified, and fully automated bundler for TypeScript and JavaScript projects, as well as an NPM and JSR publishing tool.",
  version: "1.7.114",
  projectLicense: "MIT",
  // Bump version
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "patch",
  bumpSet: "",
  // Build & Publishing
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
  binaryBuildEnabled: false,
  binaryBuildInputFile: undefined,
  binaryBuildTargets: "all",
  binaryBuildOutDir: "dist",
  binaryBuildMinify: true,
  binaryBuildSourcemap: true,
  binaryBuildBytecode: false,
  binaryBuildClean: true,
  binaryBuildWindowsIcon: undefined,
  binaryBuildWindowsHideConsole: false,
  binaryBuildAssetNaming: "[name]-[hash].[ext]",
  binaryBuildParallel: true,
  binaryBuildExternal: ["c12", "terminal-kit"],
  binaryBuildNoCompile: false,
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
  // Project configuration
  projectState: "creating",
  projectRepository: "https://github.com/reliverse/rse",
  projectDomain: "https://docs.reliverse.org/cli",
  projectCategory: "unknown",
  projectSubcategory: "unknown",
  projectTemplate: "unknown",
  projectTemplateDate: "unknown",
  projectArchitecture: "unknown",
  repoPrivacy: "unknown",
  projectGitService: "github",
  projectDeployService: "vercel",
  repoBranch: "main",
  // Primary tech stack/framework
  projectFramework: "rempts",
  projectPackageManager: "bun",
  projectRuntime: "bun",
  preferredLibraries: {
    stateManagement: "unknown",
    formManagement: "unknown",
    styling: "unknown",
    uiComponents: "unknown",
    testing: "unknown",
    authentication: "unknown",
    databaseLibrary: "drizzle",
    databaseProvider: "sqlite",
    api: "trpc",
    linting: "unknown",
    formatting: "unknown",
    payment: "unknown",
    analytics: "unknown",
    monitoring: "unknown",
    logging: "unknown",
    forms: "unknown",
    notifications: "unknown",
    search: "unknown",
    uploads: "unknown",
    validation: "zod",
    documentation: "unknown",
    icons: "unknown",
    mail: "unknown",
    cache: "unknown",
    storage: "unknown",
    cdn: "unknown",
    cms: "unknown",
    i18n: "unknown",
    seo: "unknown",
    motion: "unknown",
    charts: "unknown",
    dates: "unknown",
    markdown: "unknown",
    security: "unknown",
    routing: "unknown",
  },
  monorepo: {
    type: "none",
    packages: [],
    sharedPackages: [],
  },
  // List dependencies to exclude from checks
  ignoreDependencies: [],
  // Provide custom rules for Reliverse AI
  // You can use any json type here in {}
  customRules: {},
  // Project features
  features: {
    i18n: false,
    analytics: false,
    themeMode: "dark-light",
    authentication: true,
    api: true,
    database: true,
    testing: false,
    docker: false,
    ci: false,
    commands: [
      "pub",
      "example",
      "db",
      "latest",
      "check",
      "dev:cli",
      "dev:add",
      "dev:ai",
      "dev:clone",
      "dev:cmod",
    ],
    webview: ["react-native"],
    language: ["typescript"],
    themes: ["default", "eslint", "biome", "sonner", "uploadthing", "zod", "typebox", "lucide"],
  },
  // Code style preferences
  codeStyle: {
    dontRemoveComments: true,
    shouldAddComments: true,
    typeOrInterface: "type",
    importOrRequire: "import",
    quoteMark: "double",
    semicolons: true,
    lineWidth: 80,
    indentStyle: "space",
    indentSize: 2,
    importSymbol: "~",
    trailingCommas: "all",
    bracketSpacing: true,
    arrowParens: "always",
    tabWidth: 2,
    jsToTs: false,
    cjsToEsm: false,
    modernize: {
      replaceFs: false,
      replacePath: false,
      replaceHttp: false,
      replaceProcess: false,
      replaceConsole: false,
      replaceEvents: false,
    },
  },
  // Settings for cloning an existing repo
  multipleRepoCloneMode: false,
  customUserFocusedRepos: [],
  customDevsFocusedRepos: [],
  hideRepoSuggestions: false,
  customReposOnNewProject: false,
  // Set to false to disable opening the browser during env composing
  envComposerOpenBrowser: true,
  // Enable auto-answering for prompts to skip manual confirmations.
  // Make sure you have unknown values configured above.
  skipPromptsUseAutoBehavior: false,
  // Prompt behavior for deployment
  // Options: prompt | autoYes | autoNo
  deployBehavior: "prompt",
  depsBehavior: "prompt",
  gitBehavior: "prompt",
  i18nBehavior: "prompt",
  scriptsBehavior: "prompt",
  // Behavior for existing GitHub repos during project creation
  // Options: prompt | autoYes | autoYesSkipCommit | autoNo
  existingRepoBehavior: "prompt",
  // Behavior for Reliverse AI chat and agent mode
  // Options: promptOnce | promptEachFile | autoYes
  relinterConfirm: "promptOnce",
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
