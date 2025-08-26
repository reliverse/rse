import { defineConfig } from "./reltypes";

/**
 * @reliverse/* libraries & rse configuration
 * Hover over the fields to learn more details
 * @see https://docs.reliverse.org/libraries
 */
export default defineConfig({
  // Project configuration
  projectName: "@reliverse/rse",
  projectAuthor: "reliverse",
  projectDescription:
    "@reliverse/rse is your all-in-one daily dev companion: not just for bootstrapping projects, but for extending your entire dev toolchain. Rse CLI brings smart automation, framework-aware support (like Next.js), and an AI-powered toolbox into your terminal. Code, refactor, generate, integrate — all in one flow.",
  version: "1.7.13",
  projectLicense: "Apache-2.0",
  projectState: "unknown",
  projectRepository: "unknown",
  projectDomain: "unknown",
  projectCategory: "unknown",
  projectSubcategory: "unknown",
  projectTemplate: "unknown",
  projectTemplateDate: "unknown",
  projectArchitecture: "unknown",
  repoPrivacy: "unknown",
  projectGitService: "unknown",
  projectDeployService: "unknown",
  repoBranch: "unknown",
  projectFramework: "unknown",
  projectPackageManager: "unknown",
  projectRuntime: "unknown",
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
    type: "unknown",
    packages: [],
    sharedPackages: [],
  },
  ignoreDependencies: [],
  customRules: {},
  features: {
    i18n: false,
    analytics: false,
    themeMode: "unknown",
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
    typeOrInterface: "unknown",
    importOrRequire: "unknown",
    quoteMark: "unknown",
    semicolons: true,
    lineWidth: 80,
    indentStyle: "unknown",
    indentSize: 2,
    importSymbol: "unknown",
    trailingComma: "unknown",
    bracketSpacing: true,
    arrowParens: "unknown",
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
  deployBehavior: "unknown",
  depsBehavior: "unknown",
  gitBehavior: "unknown",
  i18nBehavior: "unknown",
  scriptsBehavior: "unknown",
  existingRepoBehavior: "unknown",
  relinterConfirm: "unknown",

  // Bump configuration
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts", "src-ts/rse.ts"],
  bumpMode: "patch",
  bumpSet: "",

  // Common configuration
  commonPubPause: false,
  commonPubRegistry: "npm",
  commonVerbose: false,
  displayBuildPubLogs: true,

  // Core configuration
  coreBuildOutDir: "bin",
  coreDeclarations: true,
  coreDescription:
    "@reliverse/rse is your all-in-one daily dev companion: not just for bootstrapping projects, but for extending your entire dev toolchain. Rse CLI brings smart automation, framework-aware support (like Next.js), and an AI-powered toolbox into your terminal. Code, refactor, generate, integrate — all in one flow.",
  coreEntryFile: "rse.ts",
  coreEntrySrcDir: "src-ts",
  coreIsCLI: {
    enabled: true,
    scripts: { rse: "rse.ts" },
  },

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

  // Libraries Reliverse Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "main-project-only",
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {},

  // @reliverse/relinka logger setup
  logsFileName: ".logs/relinka.log",
  logsFreshFile: true,

  // Dependency filtering
  // Global is always applied
  filterDepsPatterns: {
    global: ["@types", "biome", "eslint", "knip", "prettier", "@reliverse/rse"],
    "dist-npm": [],
    "dist-jsr": [],
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
