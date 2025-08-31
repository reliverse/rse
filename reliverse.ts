import { defineConfig } from "@reliverse/dler";

/**
 * @reliverse/* libraries & rse configuration
 * Hover over the fields to learn more details
 * @see https://docs.reliverse.org/libraries
 */
export default defineConfig({
  // Project configuration
  projectName: "unknown",
  projectAuthor: "unknown",
  projectDescription:
    "reliverse (prev. dler) is a flexible, unified, and fully automated bundler for TypeScript and JavaScript projects, as well as an NPM and JSR publishing tool.",
  version: "unknown",
  projectLicense: "unknown",
  projectState: "created",
  projectRepository: "unknown",
  projectDomain: "unknown",
  projectCategory: "unknown",
  projectSubcategory: "unknown",
  projectTemplate: "unknown",
  projectTemplateDate: "unknown",
  projectArchitecture: "unknown",
  repoPrivacy: "unknown",
  projectGitService: "github",
  projectDeployService: "none",
  repoBranch: "unknown",
  projectFramework: "unknown",
  projectPackageManager: "bun",
  projectRuntime: "node",
  preferredLibraries: {
    stateManagement: "unknown",
    formManagement: "unknown",
    styling: "unknown",
    uiComponents: "unknown",
    testing: "unknown",
    authentication: "unknown",
    databaseLibrary: "unknown",
    databaseProvider: "unknown",
    api: "unknown",
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
    validation: "unknown",
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
  ignoreDependencies: [],
  customRules: {},
  features: {
    i18n: false,
    analytics: false,
    themeMode: "light",
    authentication: false,
    api: false,
    database: false,
    testing: false,
    docker: false,
    ci: false,
    commands: [],
    webview: [],
    language: [],
    themes: [],
  },
  codeStyle: {
    dontRemoveComments: false,
    shouldAddComments: false,
    typeOrInterface: "mixed",
    importOrRequire: "import",
    quoteMark: "double",
    semicolons: true,
    lineWidth: 80,
    indentStyle: "space",
    indentSize: 2,
    importSymbol: "unknown",
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
  multipleRepoCloneMode: false,
  customUserFocusedRepos: [],
  customDevsFocusedRepos: [],
  hideRepoSuggestions: false,
  customReposOnNewProject: false,
  envComposerOpenBrowser: true,
  skipPromptsUseAutoBehavior: false,
  deployBehavior: "prompt",
  depsBehavior: "prompt",
  gitBehavior: "prompt",
  i18nBehavior: "prompt",
  scriptsBehavior: "prompt",
  existingRepoBehavior: "prompt",
  relinterConfirm: "promptEachFile",

  // Bump configuration
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts", "src-ts/rse.ts"],
  bumpMode: "patch",
  bumpSet: "",

  // Common configuration
  commonPubPause: false,
  commonPubRegistry: "npm",
  commonVerbose: false,
  displayBuildPubLogs: false,

  // Core configuration
  coreBuildOutDir: "bin",
  coreDeclarations: true,
  coreDescription:
    "reliverse (prev. dler) is a flexible, unified, and fully automated bundler for TypeScript and JavaScript projects, as well as an NPM and JSR publishing tool.",
  coreEntryFile: "rse.ts",
  coreEntrySrcDir: "src-ts",
  coreIsCLI: { enabled: true, scripts: { rse: "rse.ts" } },

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

  // Binary Build Configuration
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

  // Libraries Reliverse Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "main-and-libs",
  libsDirDist: "dist-libs",
  libsDirSrc: "src-ts/libs",
  libsList: {},

  // @reliverse/relinka logger setup
  logsFileName: ".logs/relinka.log",
  logsFreshFile: true,

  // Dependency filtering
  // Global is always applied
  filterDepsPatterns: {
    global: ["@types", "biome", "eslint", "knip", "prettier", "typescript", "@reliverse/rse"],
    "dist-npm": [],
    "dist-jsr": ["+bun"],
    "dist-libs": {},
  },

  // Code quality tools
  // Available: tsc, eslint, biome, knip, reliverse-check
  runBeforeBuild: [],
  // Available: reliverse-check
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
      "@reliverse/reliverse-sdk": {
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

  // Relinka Logger Configuration
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
    cleanupInterval: 10000,
    bufferSize: 4096,
    maxBufferAge: 5000,
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
      log: {
        symbol: "│",
        fallbackSymbol: "|",
        color: "dim",
        spacing: 3,
      },
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
      ts: ["ts", "js-d.ts", "ts"],
    },
  },
});
