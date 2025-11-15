// apps/rse/src/cmds/init/integrations/nextjs.ts

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { writeJsonFile, writeTextFile } from "@reliverse/dler-helpers";
import { logger } from "@reliverse/dler-logger";
import type { IntegrationContext, TempDirectory } from "../types";
import { createIntegrationTempDir } from "../utils/temp";
import { BaseIntegration } from "./base";

export class NextJsIntegration extends BaseIntegration {
  name = "nextjs";
  description =
    "Next.js React framework with App Router, TypeScript, and Tailwind CSS";
  dependencies = ["next", "react", "react-dom"];
  devDependencies = ["@types/react", "@types/react-dom", "typescript"];

  private tempDir?: TempDirectory;

  async install(context: IntegrationContext): Promise<void> {
    logger.info("🔧 Installing Next.js integration...");

    // Create temp directory for Next.js setup
    this.tempDir = context.tempDir;
    if (!this.tempDir) {
      throw new Error("Temp directory not provided for Next.js integration");
    }

    const nextjsTempPath = await createIntegrationTempDir(
      this.tempDir,
      "nextjs",
    );

    // Create Next.js app in temp directory
    logger.info("📦 Creating Next.js app in temp directory...");
    await Bun.$`bunx create-next-app@latest . --yes`
      .cwd(nextjsTempPath)
      .quiet();

    // Modify tsconfig.json to use ~/ instead of @/
    await this.updateTsConfig(nextjsTempPath);

    // Copy files to target
    await this.copyFilesToTarget(nextjsTempPath, context);

    // Install dependencies
    await this.installDependencies(context);

    // Update package.json scripts
    await this.updatePackageJsonScripts(context);
  }

  async configure(context: IntegrationContext): Promise<void> {
    logger.info("⚙️ Configuring Next.js...");

    // Create next.config.js if it doesn't exist
    const nextConfigPath = join(context.targetPath, "next.config.js");
    if (!existsSync(nextConfigPath)) {
      const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;`;

      await writeTextFile(nextConfigPath, nextConfig);
    }

    // Create tailwind.config.ts if it doesn't exist
    const tailwindConfigPath = join(context.targetPath, "tailwind.config.ts");
    if (!existsSync(tailwindConfigPath)) {
      const tailwindConfig = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;`;

      await writeTextFile(tailwindConfigPath, tailwindConfig);
    }

    logger.success("✅ Next.js configuration complete");
  }

  async postInstall(context: IntegrationContext): Promise<void> {
    logger.info("🔧 Verifying Next.js installation...");

    try {
      // Check if Next.js is properly installed
      await Bun.$`bun next --version`.cwd(context.targetPath).quiet();
      logger.success("✅ Next.js is ready to use");
      logger.info("🚀 Run 'bun dev' to start the development server");
    } catch (error) {
      logger.warn("⚠️ Next.js verification failed, but installation completed");
      if (context.verbose) {
        logger.debug(`Error: ${error}`);
      }
    }
  }

  private async updateTsConfig(tempPath: string): Promise<void> {
    const tsconfigPath = join(tempPath, "tsconfig.json");

    if (existsSync(tsconfigPath)) {
      const tsconfig = await Bun.file(tsconfigPath).json();

      // Replace @/* with ~/* in paths
      if (tsconfig.compilerOptions?.paths) {
        const newPaths: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(
          tsconfig.compilerOptions.paths,
        )) {
          const newKey = key.replace("@/*", "~/*");
          newPaths[newKey] = Array.isArray(value) ? value : [value];
        }
        tsconfig.compilerOptions.paths = newPaths;
      }

      await writeJsonFile(tsconfigPath, tsconfig);
    }
  }

  private async copyFilesToTarget(
    tempPath: string,
    context: IntegrationContext,
  ): Promise<void> {
    const filesToCopy = [
      "app",
      "public",
      "next.config.js",
      "next.config.ts",
      "tailwind.config.ts",
      "tsconfig.json",
    ];

    for (const file of filesToCopy) {
      const srcPath = join(tempPath, file);
      const destPath = join(context.targetPath, file);

      if (existsSync(srcPath)) {
        await this.copyFileOrDir(srcPath, destPath);
        logger.debug(`📄 Copied ${file}`);
      }
    }
  }

  private async copyFileOrDir(src: string, dest: string): Promise<void> {
    const stat = await Bun.file(src).stat();

    if (stat.isDirectory()) {
      // Copy directory recursively
      const glob = new Bun.Glob("**/*");
      const files = Array.from(glob.scanSync({ cwd: src, onlyFiles: true }));

      for (const file of files) {
        const srcFile = join(src, file);
        const destFile = join(dest, file);

        // Ensure destination directory exists
        mkdirSync(dirname(destFile), { recursive: true });

        // Copy file
        const content = await Bun.file(srcFile).arrayBuffer();
        await Bun.write(destFile, content);
      }
    } else {
      // Copy single file
      mkdirSync(dirname(dest), { recursive: true });
      const content = await Bun.file(src).arrayBuffer();
      await Bun.write(dest, content);
    }
  }

  private async updatePackageJsonScripts(
    context: IntegrationContext,
  ): Promise<void> {
    const packageJsonPath = join(context.targetPath, "package.json");

    try {
      const packageJson = await Bun.file(packageJsonPath).json();

      const nextjsScripts = {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      };

      packageJson.scripts = {
        ...packageJson.scripts,
        ...nextjsScripts,
      };

      await writeJsonFile(packageJsonPath, packageJson);
      logger.debug("📝 Updated package.json scripts");
    } catch (error) {
      logger.warn("⚠️ Failed to update package.json scripts");
      if (context.verbose) {
        logger.debug(`Error: ${error}`);
      }
    }
  }
}
