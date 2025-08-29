import type { MkdistOptions } from "@reliverse/dler";
import { createPerfTimer, dlerBuild, ensureReliverseConfig, mkdist } from "@reliverse/dler";
import { resolve } from "@reliverse/pathkit";
import { defineArgs, defineCommand } from "@reliverse/rempts";

// TODO: merge this command with 'build' command in the future

export default defineCommand({
  meta: {
    name: "mkdist",
    description: "Build the project using mkdist",
  },
  args: defineArgs({
    mkdistOnly: {
      type: "boolean",
      description: "Only run mkdist",
      default: true,
    },
    dev: {
      type: "boolean",
      description: "Runs the CLI in dev mode",
    },
    dir: {
      type: "positional",
      description: "Project root directory",
      default: ".",
    },
    cwd: {
      type: "string",
      description: "Current working directory",
    },
    src: {
      type: "string",
      description: "Source directory relative to project root directory",
      default: "src",
    },
    dist: {
      type: "string",
      description: "Destination directory relative to project root directory",
      default: "dist",
    },
    clean: {
      type: "boolean",
      description: "Clean the destination directory",
      default: true,
    },
    pattern: {
      type: "string",
      description: "Pattern includes or excludes files (default: '**')",
      default: "**",
    },
    format: {
      type: "string",
      description: "File format (cjs|esm)",
    },
    declaration: {
      type: "boolean",
      description: "Generate type declaration file",
      default: false,
      // alias: ["d"],
    },
    ext: {
      type: "string",
      description: "File extension (mjs|js|ts)",
      // valueHint: "mjs|js|ts",
    },
    jsx: {
      type: "string",
      description: "Specify which JSX runtime to use (transform|preserve|automatic)",
    },
    jsxFactory: {
      type: "string",
      description: "JSX factory (h|React.createElement)",
    },
    jsxFragment: {
      type: "string",
      description: "JSX fragment (Fragment|React.Fragment)",
    },
    loaders: {
      type: "string",
      description: "Loaders (js|vue|sass)",
    },
    minify: {
      type: "boolean",
      description: "Minify output files",
      default: false,
    },
    target: {
      type: "string",
      description: "Target environment (esbuild)",
    },
  }),
  async run({ args }) {
    const { dev: isDev } = args;

    if (args.mkdistOnly) {
      const {
        result: { writtenFiles },
      } = await mkdist({
        rootDir: resolve(args.cwd || process.cwd(), args.dir),
        srcDir: args.src,
        distDir: args.dist,
        cleanDist: args.clean,
        format: args.format,
        pattern: args.pattern,
        ext: args.ext,
        declaration: args.declaration,
        loaders: args.loaders?.split(","),
        esbuild: {
          jsx: args.jsx,
          jsxFactory: args.jsxFactory,
          jsxFragment: args.jsxFragment,
          minify: args.minify,
          target: args.target,
        },
      } as MkdistOptions);

      console.log(writtenFiles.map((f: string) => `- ${f}`).join("\n"));

      process.exit(0);
    }

    await ensureReliverseConfig(isDev, "ts");
    const timer = createPerfTimer();
    await dlerBuild({
      flow: "build",
      timer,
      isDev,
      config: undefined,
      debugOnlyCopyNonBuildFiles: false,
      debugDontCopyNonBuildFiles: false,
      disableOwnSpinner: false,
    });
  },
});
