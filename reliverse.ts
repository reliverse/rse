import { defineConfig } from "./reltypes";

/**
 * Reliverse Bundler Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/dler
 */
export default defineConfig({
  // RSE CONFIG (https://docs.reliverse.org/cli)
  // Restart the CLI to apply your config changes
  $schema: "./schema.json",

  // General project information
  projectName: "@reliverse/rse",
  projectAuthor: "reliverse",
  projectDescription:
    "@reliverse/rse is your all-in-one daily dev companion: not just for bootstrapping projects, but for extending your entire dev toolchain. Rse CLI brings smart automation, framework-aware support (like Next.js), and an AI-powered toolbox into your terminal. Code, refactor, generate, integrate — all in one flow.",
  version: "1.7.12",
  projectLicense: "Apache-2.0",

  // Bump configuration
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "patch",

  // Common configuration
  commonPubPause: false,
  commonPubRegistry: "npm-jsr",
  commonVerbose: true,

  // Core configuration
  coreBuildOutDir: "bin",
  coreDeclarations: true,
  coreDescription:
    "@reliverse/rse is your all-in-one companion for bootstrapping and improving any kind of projects (especially web apps built with frameworks like Next.js) — whether you're kicking off something new or upgrading an existing app. It is also a little AI-powered toolbox in your terminal, ready to help with coding, refactoring, image gen, and more.",
  coreEntryFile: "mod.ts",
  coreEntrySrcDir: "src",
  coreIsCLI: { enabled: true, scripts: { rse: "cli.ts" } },

  // JSR-only config
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrFailOnWarn: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,

  // NPM-only config
  distNpmBuilder: "mkdist",
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",

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
    trailingComma: "all",
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
        "@reliverse/rse-sdk without cli. @reliverse/rse-sdk allows you to create new plugins for @reliverse/rse CLI, interact with reliverse.org, and even extend your own CLI functionality (you may also try @reliverse/dler-sdk for this case).",
      libDirName: "sdk",
      libMainFile: "sdk/sdk-mod.ts",
      libPkgKeepDeps: true,
      libTranspileMinify: true,
      libPubPause: true,
      libPubRegistry: "npm-jsr",
    },
    "@reliverse/rse-cfg": {
      libDeclarations: true,
      libDescription: "config typescript definitions for @reliverse/rse",
      libDirName: "cfg",
      libMainFile: "cfg/cfg-mod.ts",
      libPkgKeepDeps: true, // TODO: temp
      /* libPkgKeepDeps: [
        // most of the deps here are temporary at the moment
        // TODO: move prompts and logs to dler's or rse's impl to reduce deps number
        "@reliverse/relinka",
        "@reliverse/runtime",
        "@reliverse/relifso",
        "@reliverse/pathkit",
        "@sinclair/typebox",
        "c12", // TODO: replace with @reliverse/reconf
        "confbox",
        "@reliverse/rempts",
        "execa",
        "destr",
        "magic-string",
        "jiti",
        "jsonrepair", // TODO: migrate to @reliverse/relifso (jsonrepair is already built-in there)
        "pkg-types",
      ], */
      libTranspileMinify: true,
      libPubPause: false,
      libPubRegistry: "npm-jsr",
    },
  },

  // Specifies what resources to send to npm and jsr registries.
  // coreBuildOutDir (e.g. "bin") dir is automatically included.
  // The following is also included if publishArtifacts is {}:
  // - global: ["package.json", "README.md", "LICENSE"]
  // - dist-jsr,dist-libs/jsr: ["jsr.json"]
  publishArtifacts: {
    global: ["package.json", "README.md", "LICENSE", "LICENSES"],
    "dist-jsr": [],
    "dist-npm": [],
    "dist-libs": {
      "@reliverse/rse-sdk": {
        jsr: [],
        npm: [],
      },
    },
  },

  // Files with these extensions will be built
  // Any other files will be copied as-is to dist
  buildPreExtensions: ["ts", "js"],
  // If you need to exclude some ts/js files from being built,
  // you can store them in the dirs with buildTemplatesDir name
  buildTemplatesDir: "templates",

  // Dependency filtering
  // Global is always applied
  filterDepsPatterns: {
    global: [
      "bun",
      "@types",
      "biome",
      "eslint",
      "knip",
      "prettier",
      "typescript",
      "@reliverse/rse",
      "@reliverse/dler",
      "!@reliverse/rse-sdk",
      "!@reliverse/dler-sdk",
    ],
    "dist-jsr": [],
    "dist-npm": [],
    "dist-libs": {
      "@reliverse/rse-cfg": {
        jsr: [],
        npm: [],
      },
      "@reliverse/rse-sdk": {
        jsr: [],
        npm: [],
      },
    },
  },

  // Code quality tools
  // Available: tsc, eslint, biome, knip, dler-check
  runBeforeBuild: [],
  // Available: dler-check
  runAfterBuild: [],

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
  // transpileAlias: {},
  // transpileClean: true,
  // transpileEntries: [],
  transpileEsbuild: "es2023",
  // transpileExternals: [],
  transpileFailOnWarn: false,
  transpileFormat: "esm",
  transpileMinify: true,
  // transpileParallel: false,
  transpilePublicPath: "/",
  // transpileReplace: {},
  // transpileRollup: {
  //   alias: {},
  //   commonjs: {},
  //   dts: {},
  //   esbuild: {},
  //   json: {},
  //   replace: {},
  //   resolve: {},
  // },
  // transpileShowOutLog: false,
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  // transpileStubOptions: { jiti: {} },
  transpileTarget: "node",
  transpileWatch: false,
  // transpileWatchOptions: undefined,

  // @reliverse/relinka logger setup
  logsFileName: ".logs/relinka.log",
  logsFreshFile: true,

  // Integrated relinka configuration
  // https://github.com/reliverse/relinka
  relinka: {
    verbose: false,

    // Timestamp configuration
    timestamp: {
      enabled: false,
      format: "HH:mm:ss",
    },

    // Control whether logs are saved to a file
    saveLogsToFile: false,

    // Disable colors in the console
    disableColors: false,

    // Log file configuration
    logFile: {
      outputPath: "logs.log",
      nameWithDate: "disable",
      freshLogFile: true,
    },

    // Dirs settings
    dirs: {
      maxLogFiles: 5,
    },

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
});
