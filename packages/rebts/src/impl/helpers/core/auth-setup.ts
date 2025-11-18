// Auto-generated from Better-T-Stack (https://github.com/AmanVarshney01/create-better-t-stack)
// To contribute: edit the original repo or scripts/src/cmds/bts/cmd.ts

import { re } from "@reliverse/dler-colors";
import fs from "@reliverse/dler-fs-utils";
import { logger } from "@reliverse/dler-logger";
import path from "@reliverse/dler-pathkit";
import type { ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";
import { setupBetterAuthPlugins } from "../../utils/better-auth-plugin-setup";

export async function setupAuth(config: ProjectConfig) {
  const { auth, frontend, backend, projectDir } = config;
  if (!auth || auth === "none") {
    return;
  }

  const clientDir = path.join(projectDir, "apps/web");
  const nativeDir = path.join(projectDir, "apps/native");

  const clientDirExists = await fs.pathExists(clientDir);
  const nativeDirExists = await fs.pathExists(nativeDir);
  try {
    if (backend === "convex") {
      if (auth === "clerk" && clientDirExists) {
        const hasNextJs = frontend.includes("next");
        const hasTanStackStart = frontend.includes("tanstack-start");
        const hasViteReactOther = frontend.some((f) =>
          ["tanstack-router", "react-router"].includes(f),
        );

        if (hasNextJs) {
          await addPackageDependency({
            dependencies: ["@clerk/nextjs"],
            projectDir: clientDir,
          });
        } else if (hasTanStackStart) {
          await addPackageDependency({
            dependencies: ["@clerk/tanstack-react-start", "srvx"],
            projectDir: clientDir,
          });
        } else if (hasViteReactOther) {
          await addPackageDependency({
            dependencies: ["@clerk/clerk-react"],
            projectDir: clientDir,
          });
        }
      }

      if (auth === "better-auth") {
        const convexBackendDir = path.join(projectDir, "packages/backend");
        const convexBackendDirExists = await fs.pathExists(convexBackendDir);

        const hasNativeForBA =
          frontend.includes("native-bare") ||
          frontend.includes("native-uniwind") ||
          frontend.includes("native-unistyles");

        if (convexBackendDirExists) {
          await addPackageDependency({
            dependencies: ["better-auth", "@convex-dev/better-auth"],
            customDependencies: { "better-auth": "1.3.27" },
            projectDir: convexBackendDir,
          });
          if (hasNativeForBA) {
            await addPackageDependency({
              dependencies: ["@better-auth/expo"],
              customDependencies: { "@better-auth/expo": "1.3.27" },
              projectDir: convexBackendDir,
            });
          }
        }

        if (clientDirExists) {
          const hasNextJs = frontend.includes("next");
          const hasTanStackStart = frontend.includes("tanstack-start");
          const hasViteReactOther = frontend.some((f) =>
            ["tanstack-router", "react-router"].includes(f),
          );

          if (hasNextJs) {
            await addPackageDependency({
              dependencies: ["better-auth", "@convex-dev/better-auth"],
              customDependencies: { "better-auth": "1.3.27" },
              projectDir: clientDir,
            });
          } else if (hasTanStackStart) {
            await addPackageDependency({
              dependencies: ["better-auth", "@convex-dev/better-auth"],
              customDependencies: { "better-auth": "1.3.27" },
              projectDir: clientDir,
            });
          } else if (hasViteReactOther) {
            await addPackageDependency({
              dependencies: ["better-auth", "@convex-dev/better-auth"],
              customDependencies: { "better-auth": "1.3.27" },
              projectDir: clientDir,
            });
          }
        }

        const hasNativeBare = frontend.includes("native-bare");
        const hasNativeUniwind = frontend.includes("native-uniwind");
        const hasUnistyles = frontend.includes("native-unistyles");
        if (
          nativeDirExists &&
          (hasNativeBare || hasNativeUniwind || hasUnistyles)
        ) {
          await addPackageDependency({
            dependencies: [
              "better-auth",
              "@better-auth/expo",
              "@convex-dev/better-auth",
            ],
            customDependencies: {
              "better-auth": "1.3.27",
              "@better-auth/expo": "1.3.27",
            },
            projectDir: nativeDir,
          });
        }
      }

      const hasNativeBare = frontend.includes("native-bare");
      const hasNativeUniwind = frontend.includes("native-uniwind");
      const hasUnistyles = frontend.includes("native-unistyles");
      if (
        auth === "clerk" &&
        nativeDirExists &&
        (hasNativeBare || hasNativeUniwind || hasUnistyles)
      ) {
        await addPackageDependency({
          dependencies: ["@clerk/clerk-expo"],
          projectDir: nativeDir,
        });
      }
      return;
    }

    const authPackageDir = path.join(projectDir, "packages/auth");
    const authPackageDirExists = await fs.pathExists(authPackageDir);

    if (authPackageDirExists && auth === "better-auth") {
      await addPackageDependency({
        dependencies: ["better-auth"],
        projectDir: authPackageDir,
      });
    }

    const hasWebFrontend = frontend.some((f) =>
      [
        "react-router",
        "tanstack-router",
        "tanstack-start",
        "next",
        "nuxt",
        "svelte",
        "solid",
      ].includes(f),
    );

    if (hasWebFrontend && clientDirExists) {
      if (auth === "better-auth") {
        await addPackageDependency({
          dependencies: ["better-auth"],
          projectDir: clientDir,
        });
      }
    }

    if (
      (frontend.includes("native-bare") ||
        frontend.includes("native-uniwind") ||
        frontend.includes("native-unistyles")) &&
      nativeDirExists
    ) {
      if (auth === "better-auth") {
        await addPackageDependency({
          dependencies: ["better-auth", "@better-auth/expo"],
          projectDir: nativeDir,
        });
        if (authPackageDirExists) {
          await addPackageDependency({
            dependencies: ["@better-auth/expo"],
            projectDir: authPackageDir,
          });
        }
      }
    }

    if (authPackageDirExists && auth === "better-auth") {
      await setupBetterAuthPlugins(projectDir, config);
    }
  } catch (error) {
    logger.error(re.red("Failed to configure authentication dependencies"));
    if (error instanceof Error) {
      logger.error(re.red(error.message));
    }
  }
}

export function generateAuthSecret(length = 32) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
