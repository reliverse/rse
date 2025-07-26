import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { Type } from "@sinclair/typebox";

import {
  cliDomainDocs,
  RSE_SCHEMA_DEV,
  RSE_SCHEMA_URL,
  UNKNOWN_VALUE,
} from "./cfg-consts";

const unknownLiteral = Type.Literal("unknown");

const featuresSchema = Type.Object({
  i18n: Type.Optional(Type.Boolean()),
  analytics: Type.Optional(Type.Boolean()),
  themeMode: Type.Optional(
    Type.Union([
      Type.Literal("light"),
      Type.Literal("dark"),
      Type.Literal("dark-light"),
    ]),
  ),
  authentication: Type.Optional(Type.Boolean()),
  api: Type.Optional(Type.Boolean()),
  database: Type.Optional(Type.Boolean()),
  testing: Type.Optional(Type.Boolean()),
  docker: Type.Optional(Type.Boolean()),
  ci: Type.Optional(Type.Boolean()),
  commands: Type.Optional(Type.Array(Type.String())),
  webview: Type.Optional(Type.Array(Type.String())),
  language: Type.Optional(Type.Array(Type.String())),
  themes: Type.Optional(Type.Array(Type.String())),
});

const codeStyleSchema = Type.Object({
  lineWidth: Type.Optional(Type.Number()),
  indentSize: Type.Optional(Type.Number()),
  indentStyle: Type.Optional(
    Type.Union([Type.Literal("space"), Type.Literal("tab")]),
  ),
  quoteMark: Type.Optional(
    Type.Union([Type.Literal("single"), Type.Literal("double")]),
  ),
  semicolons: Type.Optional(Type.Boolean()),
  trailingComma: Type.Optional(
    Type.Union([
      Type.Literal("none"),
      Type.Literal("es5"),
      Type.Literal("all"),
    ]),
  ),
  bracketSpacing: Type.Optional(Type.Boolean()),
  arrowParens: Type.Optional(
    Type.Union([Type.Literal("always"), Type.Literal("avoid")]),
  ),
  tabWidth: Type.Optional(Type.Number()),
  jsToTs: Type.Optional(Type.Boolean()),
  dontRemoveComments: Type.Optional(Type.Boolean()),
  shouldAddComments: Type.Optional(Type.Boolean()),
  typeOrInterface: Type.Optional(
    Type.Union([
      Type.Literal("type"),
      Type.Literal("interface"),
      Type.Literal("mixed"),
    ]),
  ),
  importOrRequire: Type.Optional(
    Type.Union([
      Type.Literal("import"),
      Type.Literal("require"),
      Type.Literal("mixed"),
    ]),
  ),
  cjsToEsm: Type.Optional(Type.Boolean()),
  modernize: Type.Optional(
    Type.Object({
      replaceFs: Type.Optional(Type.Boolean()),
      replacePath: Type.Optional(Type.Boolean()),
      replaceHttp: Type.Optional(Type.Boolean()),
      replaceProcess: Type.Optional(Type.Boolean()),
      replaceConsole: Type.Optional(Type.Boolean()),
      replaceEvents: Type.Optional(Type.Boolean()),
    }),
  ),
  importSymbol: Type.Optional(Type.String()),
});

const monorepoSchema = Type.Object({
  type: Type.Optional(
    Type.Union([
      Type.Literal("none"),
      Type.Literal("turborepo"),
      Type.Literal("nx"),
      Type.Literal("pnpm"),
      Type.Literal("bun"),
    ]),
  ),
  packages: Type.Optional(Type.Array(Type.String())),
  sharedPackages: Type.Optional(Type.Array(Type.String())),
});

const preferredLibrariesSchema = Type.Object({
  stateManagement: Type.Optional(
    Type.Union([
      Type.Literal("zustand"),
      Type.Literal("jotai"),
      Type.Literal("redux-toolkit"),
      unknownLiteral,
    ]),
  ),
  formManagement: Type.Optional(
    Type.Union([
      Type.Literal("react-hook-form"),
      Type.Literal("formik"),
      unknownLiteral,
    ]),
  ),
  styling: Type.Optional(
    Type.Union([
      Type.Literal("tailwind"),
      Type.Literal("styled-components"),
      Type.Literal("css-modules"),
      Type.Literal("sass"),
      unknownLiteral,
    ]),
  ),
  uiComponents: Type.Optional(
    Type.Union([
      Type.Literal("shadcn-ui"),
      Type.Literal("chakra-ui"),
      Type.Literal("material-ui"),
      unknownLiteral,
    ]),
  ),
  testing: Type.Optional(
    Type.Union([
      Type.Literal("bun"),
      Type.Literal("vitest"),
      Type.Literal("jest"),
      Type.Literal("playwright"),
      Type.Literal("cypress"),
      unknownLiteral,
    ]),
  ),
  authentication: Type.Optional(
    Type.Union([
      Type.Literal("better-auth"),
      Type.Literal("clerk"),
      Type.Literal("next-auth"),
      Type.Literal("supabase-auth"),
      Type.Literal("auth0"),
      unknownLiteral,
    ]),
  ),
  databaseLibrary: Type.Optional(
    Type.Union([
      Type.Literal("drizzle"),
      Type.Literal("prisma"),
      Type.Literal("supabase"),
      unknownLiteral,
    ]),
  ),
  databaseProvider: Type.Optional(
    Type.Union([
      Type.Literal("pg"),
      Type.Literal("mysql"),
      Type.Literal("sqlite"),
      Type.Literal("mongodb"),
      unknownLiteral,
    ]),
  ),
  api: Type.Optional(
    Type.Union([
      Type.Literal("hono"),
      Type.Literal("trpc"),
      Type.Literal("graphql"),
      Type.Literal("rest"),
      unknownLiteral,
    ]),
  ),
  linting: Type.Optional(Type.Union([Type.Literal("eslint"), unknownLiteral])),
  formatting: Type.Optional(
    Type.Union([Type.Literal("biome"), unknownLiteral]),
  ),
  payment: Type.Optional(Type.Union([Type.Literal("stripe"), unknownLiteral])),
  analytics: Type.Optional(
    Type.Union([Type.Literal("vercel"), unknownLiteral]),
  ),
  monitoring: Type.Optional(
    Type.Union([Type.Literal("sentry"), unknownLiteral]),
  ),
  logging: Type.Optional(Type.Union([Type.Literal("axiom"), unknownLiteral])),
  forms: Type.Optional(
    Type.Union([Type.Literal("react-hook-form"), unknownLiteral]),
  ),
  notifications: Type.Optional(
    Type.Union([Type.Literal("sonner"), unknownLiteral]),
  ),
  search: Type.Optional(Type.Union([Type.Literal("algolia"), unknownLiteral])),
  uploads: Type.Optional(
    Type.Union([Type.Literal("uploadthing"), unknownLiteral]),
  ),
  validation: Type.Optional(
    Type.Union([
      Type.Literal("zod"),
      Type.Literal("typebox"),
      Type.Literal("valibot"),
      unknownLiteral,
    ]),
  ),
  documentation: Type.Optional(
    Type.Union([
      Type.Literal("starlight"),
      Type.Literal("nextra"),
      unknownLiteral,
    ]),
  ),
  icons: Type.Optional(Type.Union([Type.Literal("lucide"), unknownLiteral])),
  mail: Type.Optional(Type.Union([Type.Literal("resend"), unknownLiteral])),
  cache: Type.Optional(Type.Union([Type.Literal("redis"), unknownLiteral])),
  storage: Type.Optional(
    Type.Union([Type.Literal("cloudflare"), unknownLiteral]),
  ),
  cdn: Type.Optional(Type.Union([Type.Literal("cloudflare"), unknownLiteral])),
  cms: Type.Optional(
    Type.Union([Type.Literal("contentlayer"), unknownLiteral]),
  ),
  i18n: Type.Optional(Type.Union([Type.Literal("next-intl"), unknownLiteral])),
  seo: Type.Optional(Type.Union([Type.Literal("next-seo"), unknownLiteral])),
  motion: Type.Optional(Type.Union([Type.Literal("framer"), unknownLiteral])),
  charts: Type.Optional(Type.Union([Type.Literal("recharts"), unknownLiteral])),
  dates: Type.Optional(Type.Union([Type.Literal("dayjs"), unknownLiteral])),
  markdown: Type.Optional(Type.Union([Type.Literal("mdx"), unknownLiteral])),
  security: Type.Optional(Type.Union([Type.Literal("auth"), unknownLiteral])),
  routing: Type.Optional(
    Type.Union([
      Type.Literal("next"),
      Type.Literal("react-router"),
      Type.Literal("tanstack-router"),
      unknownLiteral,
    ]),
  ),
});

export const rseSchema = Type.Object({
  // rseg schema
  $schema: Type.Optional(
    Type.Union([Type.Literal(RSE_SCHEMA_URL), Type.Literal(RSE_SCHEMA_DEV)]),
  ),

  // General project information
  projectName: Type.Optional(
    Type.Union([Type.Literal(UNKNOWN_VALUE), Type.String({ minLength: 1 })]),
  ),
  projectAuthor: Type.Optional(
    Type.Union([Type.Literal(UNKNOWN_VALUE), Type.String({ minLength: 1 })]),
  ),
  projectDescription: Type.Optional(Type.String()),
  version: Type.Optional(Type.String()),
  projectLicense: Type.Optional(Type.String()),
  projectRepository: Type.Optional(Type.String()),
  projectDomain: Type.Optional(Type.String()),
  projectGitService: Type.Optional(
    Type.Union([
      Type.Literal("github"),
      Type.Literal("gitlab"),
      Type.Literal("bitbucket"),
      Type.Literal("none"),
    ]),
  ),
  projectDeployService: Type.Optional(
    Type.Union([
      Type.Literal("vercel"),
      Type.Literal("netlify"),
      Type.Literal("railway"),
      Type.Literal("deno"),
      Type.Literal("none"),
    ]),
  ),
  projectPackageManager: Type.Optional(
    Type.Union([
      Type.Literal("npm"),
      Type.Literal("pnpm"),
      Type.Literal("yarn"),
      Type.Literal("bun"),
    ]),
  ),
  projectState: Type.Optional(
    Type.Union([Type.Literal("creating"), Type.Literal("created")]),
  ),
  projectCategory: Type.Optional(
    Type.Union([
      Type.Literal(UNKNOWN_VALUE),
      Type.Literal("website"),
      Type.Literal("vscode"),
      Type.Literal("browser"),
      Type.Literal("cli"),
      Type.Literal("library"),
      Type.Literal("mobile"),
    ]),
  ),
  projectSubcategory: Type.Optional(
    Type.Union([
      Type.Literal(UNKNOWN_VALUE),
      Type.Literal("e-commerce"),
      Type.Literal("tool"),
    ]),
  ),
  projectFramework: Type.Optional(
    Type.Union([
      Type.Literal(UNKNOWN_VALUE),
      // web app frameworks
      Type.Literal("nextjs"),
      Type.Literal("vite"),
      Type.Literal("svelte"),
      Type.Literal("remix"),
      Type.Literal("astro"),
      Type.Literal("nuxt"),
      Type.Literal("solid"),
      Type.Literal("qwik"),
      Type.Literal("vue"),
      Type.Literal("wxt"),
      // mobile frameworks
      Type.Literal("lynx"),
      Type.Literal("react-native"),
      Type.Literal("expo"),
      Type.Literal("capacitor"),
      Type.Literal("ionic"),
      // desktop frameworks
      Type.Literal("electron"),
      Type.Literal("tauri"),
      Type.Literal("neutralino"),
      // cli frameworks
      Type.Literal("rempts"),
      Type.Literal("citty"),
      Type.Literal("commander"),
      Type.Literal("cac"),
      Type.Literal("meow"),
      Type.Literal("yargs"),
      // vscode frameworks
      Type.Literal("vscode"),
      // browser frameworks
      Type.Literal("webextension"),
      Type.Literal("browser-extension"),
      // library frameworks
      Type.Literal("npm-jsr"),
    ]),
  ),
  projectTemplate: Type.Optional(
    Type.Union([
      Type.Literal(UNKNOWN_VALUE),
      Type.Literal("blefnk/relivator-nextjs-template"),
      Type.Literal("blefnk/relivator-docker-template"),
      Type.Literal("blefnk/next-react-ts-src-minimal"),
      Type.Literal("blefnk/all-in-one-nextjs-template"),
      Type.Literal("blefnk/create-t3-app"),
      Type.Literal("blefnk/create-next-app"),
      Type.Literal("blefnk/astro-starlight-template"),
      Type.Literal("blefnk/versator-nextjs-template"),
      Type.Literal("blefnk/relivator-lynxjs-template"),
      Type.Literal("blefnk/relivator-react-native-template"),
      Type.Literal("reliverse/template-browser-extension"),
      Type.Literal("microsoft/vscode-extension-samples"),
      Type.Literal("microsoft/vscode-extension-template"),
      Type.Literal("rsetarter-template"),
      Type.Literal("blefnk/deno-cli-tutorial"),
    ]),
  ),
  projectTemplateDate: Type.Optional(Type.String()),

  features: Type.Optional(featuresSchema),
  preferredLibraries: Type.Optional(preferredLibrariesSchema),
  codeStyle: Type.Optional(codeStyleSchema),
  monorepo: Type.Optional(monorepoSchema),
  ignoreDependencies: Type.Optional(Type.Array(Type.String())),
  customRules: Type.Optional(Type.Record(Type.String(), Type.Unknown())),

  // Custom repos configuration
  multipleRepoCloneMode: Type.Optional(Type.Boolean()),
  customUserFocusedRepos: Type.Optional(Type.Array(Type.String())),
  customDevsFocusedRepos: Type.Optional(Type.Array(Type.String())),
  hideRepoSuggestions: Type.Optional(Type.Boolean()),
  customReposOnNewProject: Type.Optional(Type.Boolean()),

  envComposerOpenBrowser: Type.Optional(Type.Boolean()),

  repoBranch: Type.Optional(Type.String()),
  repoPrivacy: Type.Optional(
    Type.Union([
      unknownLiteral,
      Type.Literal("public"),
      Type.Literal("private"),
    ]),
  ),
  projectArchitecture: Type.Optional(
    Type.Union([
      unknownLiteral,
      Type.Literal("fullstack"),
      Type.Literal("separated"),
    ]),
  ),
  projectRuntime: Type.Optional(
    Type.Union([
      Type.Literal("node"),
      Type.Literal("deno"),
      Type.Literal("bun"),
    ]),
  ),

  skipPromptsUseAutoBehavior: Type.Optional(Type.Boolean()),
  deployBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoNo"),
    ]),
  ),
  depsBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoNo"),
    ]),
  ),
  gitBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoNo"),
    ]),
  ),
  i18nBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoNo"),
    ]),
  ),
  scriptsBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoNo"),
    ]),
  ),
  existingRepoBehavior: Type.Optional(
    Type.Union([
      Type.Literal("prompt"),
      Type.Literal("autoYes"),
      Type.Literal("autoYesSkipCommit"),
      Type.Literal("autoNo"),
    ]),
  ),
  relinterConfirm: Type.Optional(
    Type.Union([
      Type.Literal("promptOnce"),
      Type.Literal("promptEachFile"),
      Type.Literal("autoYes"),
    ]),
  ),
});

/**
 * Converts a TypeBox schema to a JSON Schema
 */
function convertTypeBoxToJsonSchema(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;

  // Handle TypeBox specific conversions
  if (schema.type === "string" && schema.enum) {
    return {
      type: "string",
      enum: schema.enum,
    };
  }

  // Handle unions (convert to enum if all literals)
  if (schema.anyOf || schema.allOf || schema.oneOf) {
    const variants = schema.anyOf || schema.allOf || schema.oneOf;
    const allLiterals = variants.every((v: any) => v.const !== undefined);

    if (allLiterals) {
      return {
        type: "string",
        enum: variants.map((v: any) => v.const),
      };
    }
  }

  // Handle objects
  if (schema.type === "object") {
    const result: any = {
      type: "object",
      properties: {},
    };

    if (schema.required) {
      result.required = schema.required;
    }

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        result.properties[key] = convertTypeBoxToJsonSchema(value);
      }
    }

    // Handle additional properties
    if (schema.additionalProperties) {
      result.additionalProperties = convertTypeBoxToJsonSchema(
        schema.additionalProperties,
      );
    }

    // Handle pattern properties
    if (schema.patternProperties) {
      result.patternProperties = {};
      for (const [pattern, value] of Object.entries(schema.patternProperties)) {
        result.patternProperties[pattern] = convertTypeBoxToJsonSchema(value);
      }
    }

    return result;
  }

  // Handle arrays
  if (schema.type === "array") {
    return {
      type: "array",
      items: convertTypeBoxToJsonSchema(schema.items),
    };
  }

  // Handle basic types
  if (schema.type) {
    const result: any = { type: schema.type };
    if (schema.minimum !== undefined) result.minimum = schema.minimum;
    if (schema.maximum !== undefined) result.maximum = schema.maximum;
    if (schema.minLength !== undefined) result.minLength = schema.minLength;
    if (schema.maxLength !== undefined) result.maxLength = schema.maxLength;
    if (schema.pattern !== undefined) result.pattern = schema.pattern;
    if (schema.format !== undefined) result.format = schema.format;
    if (schema.default !== undefined) result.default = schema.default;
    return result;
  }

  return schema;
}

/**
 * Generates a JSON schema file from the TypeBox schema
 */
export async function generateJsonSchema(outputPath: string): Promise<void> {
  const converted = convertTypeBoxToJsonSchema(rseSchema);

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "rse configuration schema",
    description: cliDomainDocs,
    type: "object",
    properties: converted.properties,
    required: converted.required,
  };

  await fs.writeFile(outputPath, JSON.stringify(schema, null, 2));
}

/**
 * Generates the schema.json in the project root
 */
export async function generateSchemaFile(): Promise<void> {
  const schemaPath = path.join(process.cwd(), "schema.json");
  if (fs.existsSync(schemaPath)) {
    await fs.remove(schemaPath);
  }
  await generateJsonSchema(schemaPath);
}
