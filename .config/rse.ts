import { defineConfig } from "~/libs/cfg/cfg-impl/cfg-define";

export default defineConfig({
  // RSE CONFIG (https://docs.reliverse.org/cli)
  // Restart the CLI to apply your config changes
  $schema: "./schema.json",

  // General project information
  projectName: "@reliverse/rse",
  projectAuthor: "reliverse",
  projectDescription:
    "@reliverse/rse is your all-in-one companion for bootstrapping and improving any kind of projects (especially web apps built with frameworks like Next.js) — whether you're kicking off something new or upgrading an existing app. It is also a little AI-powered toolbox in your terminal, ready to help with coding, refactoring, image gen, and more.",
  version: "1.7.12",
  projectLicense: "MIT",
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
    themes: [
      "default",
      "eslint",
      "biome",
      "sonner",
      "uploadthing",
      "zod",
      "typebox",
      "lucide",
    ],
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
});
