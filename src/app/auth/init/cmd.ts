import {
  formatMilliseconds,
  formatWithBiome,
  generateAuthConfig,
  getDefaultAuthClientConfig,
  getDefaultAuthConfig,
  getEnvFiles,
  getLatestNpmVersion,
  getPackageInfo,
  getPackageManager,
  getTsconfigInfo,
  installDependencies,
  type OperationOptions,
  optionsSchema,
  outroText,
  type SupportedDatabases,
  type SupportedFrameworks,
  type SupportedPlugin,
  supportedDatabases,
  supportedPlugins,
  updateEnvs,
} from "@reliverse/dler";
import { re } from "@reliverse/relico";
import { existsSync } from "@reliverse/relifso";
import { relinka } from "@reliverse/relinka";
import {
  cancel,
  confirm,
  createSpinner,
  defineCommand,
  intro,
  isCancel,
  multiselect,
  outro,
  select,
  text,
} from "@reliverse/rempts";
import fs from "fs/promises";
import path from "path";
import semver from "semver";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize Better Auth in your project",
  },
  args: {
    cwd: {
      type: "string",
      description: "The working directory",
      default: process.cwd(),
    },
    config: {
      type: "string",
      description:
        "The path to the auth configuration file. defaults to the first `auth.ts` file found.",
      optional: true,
    },
    tsconfig: {
      type: "string",
      description: "The path to the tsconfig file",
      optional: true,
    },
    "skip-db": {
      type: "boolean",
      description: "Skip the database setup",
      optional: true,
    },
    "skip-plugins": {
      type: "boolean",
      description: "Skip the plugins setup",
      optional: true,
    },
    "package-manager": {
      type: "string",
      description: "The package manager you want to use",
      optional: true,
    },
  },
  async run({ args }) {
    console.log();
    intro("👋 Initializing Better Auth");

    const options = optionsSchema.parse(args);

    const cwd = path.resolve(options.cwd);
    let packageManagerPreference: "bun" | "pnpm" | "yarn" | "npm" | undefined;

    let config_path = "";
    let framework: SupportedFrameworks = "vanilla";

    const format = async (code: string) => await formatWithBiome(code, config_path);

    // ===== package.json =====
    let packageInfo: Record<string, any>;
    try {
      packageInfo = getPackageInfo(cwd) as Record<string, any>;
    } catch (error) {
      relinka("error", `❌ Couldn't read your package.json file. (dir: ${cwd})`);
      relinka("error", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    // ===== ENV files =====
    const envFiles = await getEnvFiles(cwd);
    if (!envFiles.length) {
      outro("❌ No .env files found. Please create an env file first.");
      process.exit(0);
    }
    let targetEnvFile: string;
    if (envFiles.includes(".env")) targetEnvFile = ".env";
    else if (envFiles.includes(".env.local")) targetEnvFile = ".env.local";
    else if (envFiles.includes(".env.development")) targetEnvFile = ".env.development";
    else if (envFiles.length === 1) targetEnvFile = envFiles[0]!;
    else targetEnvFile = "none";

    // ===== tsconfig.json =====
    let tsconfigInfo: Record<string, any>;
    try {
      const tsconfigPath =
        options.tsconfig !== undefined
          ? path.resolve(cwd, options.tsconfig)
          : path.join(cwd, "tsconfig.json");

      tsconfigInfo = (await getTsconfigInfo(cwd, tsconfigPath)) as Record<string, any>;
    } catch (error) {
      relinka("error", `❌ Couldn't read your tsconfig.json file. (dir: ${cwd})`);
      console.error(error);
      process.exit(1);
    }
    if (
      !(
        "compilerOptions" in tsconfigInfo &&
        "strict" in tsconfigInfo.compilerOptions &&
        tsconfigInfo.compilerOptions.strict === true
      )
    ) {
      relinka(
        "warn",
        `Better Auth requires your tsconfig.json to have "compilerOptions.strict" set to true.`,
      );
      const shouldAdd = await confirm({
        message: `Would you like us to set ${re.bold(`strict`)} to ${re.bold(`true`)}?`,
      });
      if (isCancel(shouldAdd)) {
        cancel(`✋ Operation cancelled.`);
        process.exit(0);
      }
      if (shouldAdd) {
        try {
          await fs.writeFile(path.join(cwd, "tsconfig.json"), "utf-8");
          relinka("success", `🚀 tsconfig.json successfully updated!`);
        } catch (error) {
          relinka("error", `Failed to add "compilerOptions.strict" to your tsconfig.json file.`);
          console.error(error);
          process.exit(1);
        }
      }
    }

    // ===== install better-auth =====
    const s = createSpinner({ text: "Checking better-auth installation" });
    s.start(`Checking better-auth installation`);

    let latest_betterauth_version: string;
    try {
      latest_betterauth_version = await getLatestNpmVersion("better-auth");
    } catch (error) {
      relinka("error", `❌ Couldn't get latest version of better-auth.`);
      console.error(error);
      process.exit(1);
    }

    if (
      !packageInfo.dependencies ||
      !Object.keys(packageInfo.dependencies).includes("better-auth")
    ) {
      s.stopAndPersist({ text: "Finished fetching latest version of better-auth." });
      const s2 = createSpinner({ text: "Installing Better Auth" });
      const shouldInstallBetterAuthDep = await confirm({
        message: `Would you like to install Better Auth?`,
      });
      if (isCancel(shouldInstallBetterAuthDep)) {
        cancel(`✋ Operation cancelled.`);
        process.exit(0);
      }
      if (packageManagerPreference === undefined) {
        packageManagerPreference = await getPackageManager();
      }
      if (shouldInstallBetterAuthDep) {
        s2.start(`Installing Better Auth using ${re.bold(packageManagerPreference)}`);
        try {
          const start = Date.now();
          await installDependencies({
            dependencies: ["better-auth@latest"],
            packageManager: packageManagerPreference,
            cwd: cwd,
          } as OperationOptions);
          s2.stopAndPersist({
            text: `Better Auth installed ${re.greenBright(`successfully`)}! ${re.gray(
              `(${formatMilliseconds(Date.now() - start)})`,
            )}`,
          });
        } catch (error: any) {
          s2.stopAndPersist({ text: `Failed to install Better Auth:` });
          console.error(error);
          process.exit(1);
        }
      }
    } else if (
      packageInfo.dependencies["better-auth"] !== "workspace:*" &&
      semver.lt(
        semver.coerce(packageInfo.dependencies["better-auth"])?.toString() ?? "",
        semver.clean(latest_betterauth_version) ?? "",
      )
    ) {
      s.stopAndPersist({ text: "Finished fetching latest version of better-auth." });
      const shouldInstallBetterAuthDep = await confirm({
        message: `Your current Better Auth dependency is out-of-date. Would you like to update it? (${re.bold(
          packageInfo.dependencies["better-auth"],
        )} → ${re.bold(`v${latest_betterauth_version}`)})`,
      });
      if (isCancel(shouldInstallBetterAuthDep)) {
        cancel(`✋ Operation cancelled.`);
        process.exit(0);
      }
      if (shouldInstallBetterAuthDep) {
        if (packageManagerPreference === undefined) {
          packageManagerPreference = await getPackageManager();
        }
        const s = createSpinner({ text: "Updating Better Auth" });
        s.start(`Updating Better Auth using ${re.bold(packageManagerPreference)}`);
        try {
          const start = Date.now();
          await installDependencies({
            dependencies: ["better-auth@latest"],
            packageManager: packageManagerPreference,
            cwd: cwd,
          } as OperationOptions);
          s.stopAndPersist({
            text: `Better Auth updated ${re.greenBright(`successfully`)}! ${re.gray(
              `(${formatMilliseconds(Date.now() - start)})`,
            )}`,
          });
        } catch (error: any) {
          s.stopAndPersist({ text: `Failed to update Better Auth:` });
          relinka("error", error.message);
          process.exit(1);
        }
      }
    } else {
      s.stopAndPersist({
        text: `Better Auth dependencies are ${re.greenBright(`up to date`)}!`,
      });
    }

    // ===== appName =====

    const packageJson = getPackageInfo(cwd) as Record<string, any>;
    let appName: string;
    if (!packageJson.name) {
      const newAppName = await text({
        message: "What is the name of your application?",
      });
      if (isCancel(newAppName)) {
        cancel("✋ Operation cancelled.");
        process.exit(0);
      }
      appName = newAppName;
    } else {
      appName = packageJson.name;
    }

    // ===== config path =====

    let possiblePaths = ["auth.ts", "auth.tsx", "auth.js", "auth.jsx"];
    possiblePaths = [
      ...possiblePaths,
      ...possiblePaths.map((it) => `lib/server/${it}`),
      ...possiblePaths.map((it) => `server/${it}`),
      ...possiblePaths.map((it) => `lib/${it}`),
      ...possiblePaths.map((it) => `utils/${it}`),
    ];
    possiblePaths = [
      ...possiblePaths,
      ...possiblePaths.map((it) => `src/${it}`),
      ...possiblePaths.map((it) => `app/${it}`),
    ];

    if (options.config) {
      config_path = path.join(cwd, options.config);
    } else {
      for (const possiblePath of possiblePaths) {
        const doesExist = existsSync(path.join(cwd, possiblePath));
        if (doesExist) {
          config_path = path.join(cwd, possiblePath);
          break;
        }
      }
    }

    // ===== create auth config =====
    let current_user_config = "";
    let database: SupportedDatabases | null = null;
    let add_plugins: SupportedPlugin[] = [];

    if (!config_path) {
      const shouldCreateAuthConfig = await select({
        message: `Would you like to create an auth config file?`,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      });
      if (isCancel(shouldCreateAuthConfig)) {
        cancel(`✋ Operation cancelled.`);
        process.exit(0);
      }
      if (shouldCreateAuthConfig === "yes") {
        const shouldSetupDb = await confirm({
          message: `Would you like to set up your ${re.bold(`database`)}?`,
          initialValue: true,
        });
        if (isCancel(shouldSetupDb)) {
          cancel(`✋ Operating cancelled.`);
          process.exit(0);
        }
        if (shouldSetupDb) {
          const prompted_database = await select({
            message: "Choose a Database Dialect",
            options: supportedDatabases.map((it) => ({ value: it, label: it })),
          });
          if (isCancel(prompted_database)) {
            cancel(`✋ Operating cancelled.`);
            process.exit(0);
          }
          database = prompted_database;
        }

        if (options["skip-plugins"] !== false) {
          const shouldSetupPlugins = await confirm({
            message: `Would you like to set up ${re.bold(`plugins`)}?`,
          });
          if (isCancel(shouldSetupPlugins)) {
            cancel(`✋ Operating cancelled.`);
            process.exit(0);
          }
          if (shouldSetupPlugins) {
            const prompted_plugins = await multiselect({
              message: "Select your new plugins",
              options: supportedPlugins
                .filter((x) => x.id !== "next-cookies")
                .map((x) => ({ value: x.id, label: x.id })),
              required: false,
            });
            if (isCancel(prompted_plugins)) {
              cancel(`✋ Operating cancelled.`);
              process.exit(0);
            }
            add_plugins = prompted_plugins.map((x) => supportedPlugins.find((y) => y.id === x)!);

            const possible_next_config_paths = [
              "next.config.js",
              "next.config.ts",
              "next.config.mjs",
              ".next/server/next.config.js",
              ".next/server/next.config.ts",
              ".next/server/next.config.mjs",
            ];
            for (const possible_next_config_path of possible_next_config_paths) {
              if (existsSync(path.join(cwd, possible_next_config_path))) {
                framework = "nextjs";
                break;
              }
            }
            if (framework === "nextjs") {
              const result = await confirm({
                message: `It looks like you're using NextJS. Do you want to add the next-cookies plugin? ${re.bold(
                  `(Recommended)`,
                )}`,
              });
              if (isCancel(result)) {
                cancel(`✋ Operating cancelled.`);
                process.exit(0);
              }
              if (result) {
                add_plugins.push(supportedPlugins.find((x) => x.id === "next-cookies")!);
              }
            }
          }
        }

        const filePath = path.join(cwd, "auth.ts");
        config_path = filePath;
        relinka("info", `Creating auth config file: ${filePath}`);
        try {
          current_user_config = await getDefaultAuthConfig({
            appName,
          });
          const { dependencies, envs, generatedCode } = await generateAuthConfig({
            current_user_config,
            format,
            // @ts-expect-error TODO: fix ts
            s,
            plugins: add_plugins,
            database,
          });
          current_user_config = generatedCode;
          await fs.writeFile(filePath, current_user_config);
          config_path = filePath;
          relinka("success", `🚀 Auth config file successfully created!`);

          if (envs.length !== 0) {
            relinka(
              "info",
              `There are ${envs.length} environment variables for your database of choice.`,
            );
            const shouldUpdateEnvs = await confirm({
              message: `Would you like us to update your ENV files?`,
            });
            if (isCancel(shouldUpdateEnvs)) {
              cancel("✋ Operation cancelled.");
              process.exit(0);
            }
            if (shouldUpdateEnvs) {
              const filesToUpdate = await multiselect({
                message: "Select the .env files you want to update",
                options: envFiles.map((x) => ({
                  value: path.join(cwd, x),
                  label: x,
                })),
                required: false,
              });
              if (isCancel(filesToUpdate)) {
                cancel("✋ Operation cancelled.");
                process.exit(0);
              }
              if (filesToUpdate.length === 0) {
                relinka("info", "No .env files to update. Skipping...");
              } else {
                try {
                  await updateEnvs({
                    files: filesToUpdate,
                    envs,
                    isCommented: true,
                  });
                } catch (error) {
                  relinka("error", `Failed to update .env files:`);
                  relinka("error", JSON.stringify(error, null, 2));
                  process.exit(1);
                }
                relinka("success", `🚀 ENV files successfully updated!`);
              }
            }
          }
          if (dependencies.length !== 0) {
            relinka(
              "info",
              `There are ${dependencies.length} dependencies to install. (${dependencies
                .map((x) => re.green(x))
                .join(", ")})`,
            );
            const shouldInstallDeps = await confirm({
              message: `Would you like us to install dependencies?`,
            });
            if (isCancel(shouldInstallDeps)) {
              cancel("✋ Operation cancelled.");
              process.exit(0);
            }
            if (shouldInstallDeps) {
              const s = createSpinner({ text: "Installing dependencies" });
              if (packageManagerPreference === undefined) {
                packageManagerPreference = await getPackageManager();
              }
              s.start(`Installing dependencies using ${re.bold(packageManagerPreference)}...`);
              try {
                const start = Date.now();
                await installDependencies({
                  dependencies: dependencies,
                  packageManager: packageManagerPreference,
                  cwd: cwd,
                } as OperationOptions);
                s.stopAndPersist({
                  text: `Dependencies installed ${re.greenBright(`successfully`)} ${re.gray(
                    `(${formatMilliseconds(Date.now() - start)})`,
                  )}`,
                });
              } catch (error: any) {
                s.stopAndPersist({
                  text: `Failed to install dependencies using ${packageManagerPreference}:`,
                });
                relinka("error", error.message);
                process.exit(1);
              }
            }
          }
        } catch (error) {
          relinka("error", `Failed to create auth config file: ${filePath}`);
          console.error(error);
          process.exit(1);
        }
      } else if (shouldCreateAuthConfig === "no") {
        relinka("info", `Skipping auth config file creation.`);
      }
    } else {
      relinka("success", `Found auth config file. ${re.gray(`(${config_path})`)}`);
    }

    // ===== auth client path =====

    let possibleClientPaths = [
      "auth-client.ts",
      "auth-client.tsx",
      "auth-client.js",
      "auth-client.jsx",
      "client.ts",
      "client.tsx",
      "client.js",
      "client.jsx",
    ];
    possibleClientPaths = [
      ...possibleClientPaths,
      ...possibleClientPaths.map((it) => `lib/server/${it}`),
      ...possibleClientPaths.map((it) => `server/${it}`),
      ...possibleClientPaths.map((it) => `lib/${it}`),
      ...possibleClientPaths.map((it) => `utils/${it}`),
    ];
    possibleClientPaths = [
      ...possibleClientPaths,
      ...possibleClientPaths.map((it) => `src/${it}`),
      ...possibleClientPaths.map((it) => `app/${it}`),
    ];

    let authClientConfigPath: string | null = null;
    for (const possiblePath of possibleClientPaths) {
      const doesExist = existsSync(path.join(cwd, possiblePath));
      if (doesExist) {
        authClientConfigPath = path.join(cwd, possiblePath);
        break;
      }
    }

    if (!authClientConfigPath) {
      const choice = await select({
        message: `Would you like to create an auth client config file?`,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      });
      if (isCancel(choice)) {
        cancel(`✋ Operation cancelled.`);
        process.exit(0);
      }
      if (choice === "yes") {
        authClientConfigPath = path.join(cwd, "auth-client.ts");
        relinka("info", `Creating auth client config file: ${authClientConfigPath}`);
        try {
          const contents = await getDefaultAuthClientConfig({
            auth_config_path: `./${path.join(config_path.replace(cwd, ""))}`.replace(".//", "./"),
            clientPlugins: add_plugins
              .filter((x) => x.clientName)
              .map((plugin) => {
                let contents = "";
                if (plugin.id === "one-tap") {
                  contents = `{ clientId: "MY_CLIENT_ID" }`;
                }
                return {
                  contents,
                  id: plugin.id,
                  name: plugin.clientName!,
                  imports: [
                    {
                      path: "better-auth/client/plugins",
                      variables: [{ name: plugin.clientName! }],
                    },
                  ],
                };
              }),
            framework: framework,
          });
          await fs.writeFile(authClientConfigPath, contents);
          relinka("success", `🚀 Auth client config file successfully created!`);
        } catch (error) {
          relinka("error", `Failed to create auth client config file: ${authClientConfigPath}`);
          relinka("error", JSON.stringify(error, null, 2));
          process.exit(1);
        }
      } else if (choice === "no") {
        relinka("info", `Skipping auth client config file creation.`);
      }
    } else {
      relinka("success", `Found auth client config file. ${re.gray(`(${authClientConfigPath})`)}`);
    }

    if (targetEnvFile !== "none") {
      try {
        // const fileContents = await fs.readFile(path.join(cwd, targetEnvFile), "utf8");
        // const parsed = parse(fileContents); // TODO: migrate to dotenvx
        const parsed = {
          BETTER_AUTH_SECRET: "some_value",
          BETTER_AUTH_URL: "http://localhost:3000",
        };
        let isMissingSecret = false;
        let isMissingUrl = false;
        if (parsed.BETTER_AUTH_SECRET === undefined) isMissingSecret = true;
        if (parsed.BETTER_AUTH_URL === undefined) isMissingUrl = true;
        if (isMissingSecret || isMissingUrl) {
          let txt = "";
          if (isMissingSecret && !isMissingUrl) txt = re.bold(`BETTER_AUTH_SECRET`);
          else if (!isMissingSecret && isMissingUrl) txt = re.bold(`BETTER_AUTH_URL`);
          else txt = `${re.underline(`BETTER_AUTH_SECRET`)} and ${re.underline(`BETTER_AUTH_URL`)}`;
          relinka("warn", `Missing ${txt} in ${targetEnvFile}`);

          const shouldAdd = await select({
            message: `Do you want to add ${txt} to ${targetEnvFile}?`,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
              { label: "Choose other file(s)", value: "other" },
            ],
          });
          if (isCancel(shouldAdd)) {
            cancel(`✋ Operation cancelled.`);
            process.exit(0);
          }
          const envs: string[] = [];
          if (isMissingSecret) {
            envs.push("BETTER_AUTH_SECRET");
          }
          if (isMissingUrl) {
            envs.push("BETTER_AUTH_URL");
          }
          if (shouldAdd === "yes") {
            try {
              await updateEnvs({
                files: [path.join(cwd, targetEnvFile)],
                envs: envs,
                isCommented: false,
              });
            } catch (error) {
              relinka("error", `Failed to add ENV variables to ${targetEnvFile}`);
              relinka("error", JSON.stringify(error, null, 2));
              process.exit(1);
            }
            relinka("success", `🚀 ENV variables successfully added!`);
            if (isMissingUrl) {
              relinka(
                "info",
                `Be sure to update your BETTER_AUTH_URL according to your app's needs.`,
              );
            }
          } else if (shouldAdd === "no") {
            relinka("info", `Skipping ENV step.`);
          } else if (shouldAdd === "other") {
            if (!envFiles.length) {
              cancel("No env files found. Please create an env file first.");
              process.exit(0);
            }
            const envFilesToUpdate = await multiselect({
              message: "Select the .env files you want to update",
              options: envFiles.map((x) => ({
                value: path.join(cwd, x),
                label: x,
              })),
              required: false,
            });
            if (isCancel(envFilesToUpdate)) {
              cancel("✋ Operation cancelled.");
              process.exit(0);
            }
            if (envFilesToUpdate.length === 0) {
              relinka("info", "No .env files to update. Skipping...");
            } else {
              try {
                await updateEnvs({
                  files: envFilesToUpdate,
                  envs: envs,
                  isCommented: false,
                });
              } catch (error) {
                relinka("error", `Failed to update .env files:`);
                relinka("error", JSON.stringify(error, null, 2));
                process.exit(1);
              }
              relinka("success", `🚀 ENV files successfully updated!`);
            }
          }
        }
      } catch (_error) {
        // if fails, ignore, and do not proceed with ENV operations.
      }
    }

    outro(outroText);
    console.log();
    process.exit(0);
  },
});
