import { ensuredir } from "@reliverse/fs";
import { selectPrompt } from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";
import { exec } from "child_process";
import fs from "fs-extra";
import https from "https";
import { HttpsProxyAgent } from "https-proxy-agent";
import { installDependencies } from "nypm";
import path, { dirname } from "pathe";
import prettyBytes from "pretty-bytes";
import { simpleGit } from "simple-git";
import { extract } from "tar";
import { promisify } from "util";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";

import {
  cliConfigJsonc,
  cliConfigTs,
  cliHomeRepos,
} from "~/libs/cfg/constants/cfg-details.js";
import { initGitDir } from "~/libs/sdk/init/use-template/cp-modules/git-deploy-prompts/git.js";
import {
  rmEnsureDir,
  setHiddenAttributeOnWindows,
} from "~/libs/sdk/utils/filesysHelpers.js";
import { getReliverseConfigPath } from "~/libs/sdk/utils/reliverseConfig/rc-path.js";

const execAsync = promisify(exec);

/**
 * Defines the options for downloading a project from a remote repository.
 */
type DownloadRepoOptions = {
  repoURL: string;
  projectName: string;
  isDev: boolean;
  cwd: string;
  githubToken?: string;
  install?: boolean;
  provider?: "github" | "gitlab" | "bitbucket" | "sourcehut";
  subdirectory?: string;
  force?: boolean;
  forceClean?: boolean;
  preserveGit?: boolean;
  config?: ReliverseConfig | undefined;
  returnTime?: boolean;
  returnSize?: boolean;
  returnConcurrency?: boolean;
  fastCloneSource?: string;
  isTemplateDownload: boolean;
  cache?: boolean;
};

/**
 * Minimal structure containing repository metadata needed for download operations.
 */
type RepoInfo = {
  name: string;
  version: string;
  gitUrl?: string;
  subdir?: string;
  defaultDir?: string;
  headers?: Record<string, string>;
};

type GitProvider = "github" | "gitlab" | "bitbucket" | "sourcehut";

/**
 * Represents the result of a successful download operation.
 */
export type DownloadResult = {
  source: string;
  dir: string;
  time?: number;
  size?: number;
  sizePretty?: string;
  concurrency?: number;
};

/**
 * Recursively calculates the total size of a folder in bytes.
 */
async function getFolderSize(
  directory: string,
  skipDirs: string[] = [],
): Promise<number> {
  let totalSize = 0;
  const entries = await fs.readdir(directory);
  for (const entry of entries) {
    if (skipDirs.includes(entry)) continue;
    const fullPath = path.join(directory, entry);
    const stats = await fs.stat(fullPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += await getFolderSize(fullPath, skipDirs);
    }
  }
  return totalSize;
}

/**
 * Parses a Git URI and extracts provider, repo, ref, and subdirectory.
 */
function parseGitURI(input: string) {
  const normalizedInput = input
    .trim()
    .replace(
      /^https?:\/\/(www\.)?(github|gitlab|bitbucket|sourcehut)\.com\//,
      "",
    )
    .replace(/^(github|gitlab|bitbucket|sourcehut)\.com\//, "")
    .replace(/^https?:\/\/git\.sr\.ht\/~/, "")
    .replace(/^git\.sr\.ht\/~/, "");
  const pattern =
    /^(?:(?<provider>[^:]+):)?(?<repo>[^#]+)(?<refPart>#[^/]+)?(?<subdir>\/.*)?$/;
  const match = pattern.exec(normalizedInput);
  if (!match?.groups) {
    return {
      provider: undefined,
      repo: normalizedInput,
      ref: "main",
      subdir: "",
    };
  }
  const { provider, repo, refPart, subdir } = match.groups;
  return {
    provider: provider?.trim(),
    repo: repo?.trim() ?? normalizedInput,
    ref: refPart ? refPart.slice(1).trim() : "main",
    subdir: subdir?.trim() ?? "",
  };
}

/**
 * Returns the repository URL based on the provider.
 */
function getRepoUrl(repo: string, provider: GitProvider): string {
  switch (provider) {
    case "gitlab":
      return `https://gitlab.com/${repo}.git`;
    case "bitbucket":
      return `https://bitbucket.org/${repo}.git`;
    case "sourcehut":
      return `https://git.sr.ht/~${repo}`;
    default:
      return `https://github.com/${repo}.git`;
  }
}

/**
 * Computes final RepoInfo from the raw repo string.
 */
function computeRepoInfo(
  input: string,
  defaultProvider: GitProvider,
  githubToken?: string,
  subdirectory?: string,
): RepoInfo {
  const { provider: parsedProvider, repo, ref, subdir } = parseGitURI(input);
  const actualProvider = (parsedProvider ?? defaultProvider) as GitProvider;
  const name = repo.replace("/", "-");
  const headers: Record<string, string> = {};
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  const gitUrl = getRepoUrl(repo, actualProvider);
  return {
    name,
    version: ref,
    subdir: subdirectory ?? subdir.replace(/^\/+/, ""),
    defaultDir: name,
    headers,
    gitUrl,
  };
}

/**
 * Generates a unique project path if the target directory exists.
 */
async function getUniqueProjectPath(
  basePath: string,
  projectName: string,
  isDev: boolean,
): Promise<string> {
  let iteration = 1;
  let currentPath = basePath;
  let currentName = projectName;
  while (await fs.pathExists(currentPath)) {
    currentName = `${projectName}-${iteration}`;
    currentPath = isDev
      ? path.join(dirname(basePath), "tests-runtime", currentName)
      : path.join(dirname(basePath), currentName);
    iteration++;
  }
  return currentPath;
}

/**
 * Helper: Uses git ls-remote to get the commit hash for the given ref.
 */
async function getCommitHash(repoUrl: string, ref: string): Promise<string> {
  const { stdout } = await execAsync(`git ls-remote ${repoUrl} ${ref}`);
  const lines = stdout.split("\n").filter(Boolean);
  if (!lines.length) {
    throw new Error(`Could not find commit hash for ref ${ref}`);
  }
  const firstLine = lines[0];
  if (!firstLine) {
    throw new Error("Invalid git response format");
  }
  const [hash] = firstLine.split("\t");
  if (!hash) {
    throw new Error("Failed to extract commit hash from git response");
  }
  return hash;
}

/**
 * Helper: Downloads a tarball from a URL to a destination file.
 * Supports proxy from process.env.https_proxy.
 */
function downloadTarball(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proxy = process.env.https_proxy;
    const options = proxy ? { agent: new HttpsProxyAgent(proxy) } : {};
    https
      .get(url, options, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(
            new Error(
              `Failed to download tarball: ${response.statusCode} ${response.statusMessage}`,
            ),
          );
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve());
        });
      })
      .on("error", (err) => {
        fs.unlink(dest).catch((unlinkErr) =>
          console.error("Failed to unlink:", unlinkErr),
        );
        reject(err);
      });
  });
}

/**
 * Helper: Extracts a tarball file to the destination directory.
 */
async function extractTarball(
  tarball: string,
  dest: string,
  subdir = "",
): Promise<void> {
  const strip = subdir ? subdir.split("/").length : 1;
  await extract({ file: tarball, C: dest, strip });
}

/**
 * Downloads a repository.
 * Integrates an optional tarball cache branch if `cache` is enabled and preserveGit is false.
 */
export async function downloadRepo({
  repoURL,
  projectName,
  isDev,
  cwd,
  githubToken,
  install = false,
  provider = "github",
  subdirectory,
  force = false,
  forceClean = false,
  preserveGit = true,
  config,
  returnTime = false,
  returnSize = false,
  returnConcurrency = false,
  fastCloneSource,
  isTemplateDownload,
  cache = false,
}: DownloadRepoOptions): Promise<DownloadResult> {
  relinka("info-verbose", `Downloading repo ${repoURL}...`);
  const startTime = Date.now();
  let tempCloneDir: string | undefined = undefined;
  const maxConcurrentProcesses = 6;

  // Decide where to create the project
  let projectPath = isDev
    ? path.join(cwd, "tests-runtime", projectName)
    : path.join(cwd, projectName);
  relinka("info-verbose", `Preparing to place repo in: ${projectPath}`);

  // Handle existing directory
  if (forceClean) {
    await fs.remove(projectPath);
  } else if (!force && (await fs.pathExists(projectPath))) {
    const files = await fs.readdir(projectPath);
    const hasOnlyReliverseConfig =
      files.length === 1 && files[0] === cliConfigJsonc;
    if (files.length > 0 && !hasOnlyReliverseConfig) {
      projectPath = await getUniqueProjectPath(projectPath, projectName, isDev);
      relinka(
        "info-verbose",
        `Directory already exists. Using new path: ${projectPath}`,
      );
    }
  }
  await ensuredir(projectPath);

  // Handle reliverse config file (backup or delete)
  const parentDir = dirname(projectPath);
  try {
    await getReliverseConfigPath(parentDir, isDev, true);
  } catch (_error) {
    // Ignore errors
  }
  const { configPath: projectReliverseConfigPath } =
    await getReliverseConfigPath(projectPath, isDev, true);
  const hasReliverseConfig = await fs.pathExists(projectReliverseConfigPath);
  if (hasReliverseConfig) {
    const choice = await selectPrompt({
      title: `${projectReliverseConfigPath} already exists in parent directory. What would you like to do?`,
      options: [
        { value: "delete", label: "Delete existing file" },
        { value: "backup", label: "Create backup" },
      ],
    });
    if (choice === "delete") {
      await fs.remove(projectReliverseConfigPath);
    } else {
      let backupPath = path.join(
        parentDir,
        projectReliverseConfigPath.endsWith(cliConfigJsonc)
          ? "reliverse-bak.jsonc"
          : "reliverse-bak.ts",
      );
      let iteration = 1;
      while (await fs.pathExists(backupPath)) {
        backupPath = path.join(
          parentDir,
          `${
            projectReliverseConfigPath.endsWith(cliConfigJsonc)
              ? "reliverse-bak-"
              : "reliverse-bak-"
          }${iteration}.${
            projectReliverseConfigPath.endsWith(cliConfigJsonc) ? "jsonc" : "ts"
          }`,
        );
        iteration++;
      }
      await fs.move(projectReliverseConfigPath, backupPath);
    }
    await fs.move(
      path.join(
        projectPath,
        projectReliverseConfigPath.endsWith(cliConfigJsonc)
          ? cliConfigJsonc
          : cliConfigTs,
      ),
      projectReliverseConfigPath,
    );
    await rmEnsureDir(projectPath);
  }

  // Parse and compute final repo info
  const repoInfo = computeRepoInfo(
    repoURL,
    provider,
    githubToken,
    subdirectory,
  );
  if (!repoInfo.gitUrl) {
    throw new Error(`Invalid repository URL or provider: ${repoURL}`);
  }

  // Prepare final URL (embed auth token if provided)
  let finalUrl = repoInfo.gitUrl;
  if (githubToken) {
    const authUrl = new URL(repoInfo.gitUrl);
    authUrl.username = "oauth2";
    authUrl.password = githubToken;
    finalUrl = authUrl.toString();
  }

  // --- Cache Branch: Use tarball download if cache enabled and not preserving Git ---
  if (cache && !preserveGit) {
    relinka("info-verbose", "Using tarball cache method...");
    // Compute commit hash
    const commitHash = await getCommitHash(finalUrl, repoInfo.version);
    // Setup tarball cache directory
    const tarballCacheDir = path.join(cliHomeRepos, "tarball-cache");
    await ensuredir(tarballCacheDir);
    const tarballFile = path.join(tarballCacheDir, `${commitHash}.tar.gz`);

    // If tarball not already cached, download it
    if (!(await fs.pathExists(tarballFile))) {
      let tarUrl = "";
      if (repoInfo.gitUrl.includes("gitlab.com")) {
        tarUrl = `${repoInfo.gitUrl.replace(".git", "")}/repository/archive.tar.gz?ref=${commitHash}`;
      } else if (repoInfo.gitUrl.includes("bitbucket.org")) {
        tarUrl = `${repoInfo.gitUrl.replace(".git", "")}/get/${commitHash}.tar.gz`;
      } else {
        // Default: GitHub
        tarUrl = `${repoInfo.gitUrl.replace(".git", "")}/archive/${commitHash}.tar.gz`;
      }
      relinka("info-verbose", `Downloading tarball from ${tarUrl}`);
      await downloadTarball(tarUrl, tarballFile);
    }
    relinka("info-verbose", `Extracting tarball to ${projectPath}`);
    await extractTarball(tarballFile, projectPath, repoInfo.subdir);
    const durationSeconds = (Date.now() - startTime) / 1000;
    const result: DownloadResult = { source: repoURL, dir: projectPath };
    if (returnTime) result.time = durationSeconds;
    if (returnSize) {
      const folderSizeBytes = await getFolderSize(projectPath, [".git"]);
      const sizeMB = parseFloat((folderSizeBytes / (1024 * 1024)).toFixed(2));
      result.size = sizeMB;
      result.sizePretty = prettyBytes(folderSizeBytes);
    }
    if (returnConcurrency) result.concurrency = 1;
    return result;
  }
  // --- End Cache Branch ---

  // 6) Clone or fast clone the repository
  if (fastCloneSource) {
    relinka("info-verbose", `Using fast clone method from: ${fastCloneSource}`);
    await fs.copy(fastCloneSource, path.join(projectPath, ".git"));
    const git = simpleGit({ maxConcurrentProcesses });
    await git.cwd(projectPath);
    await git.checkout(["--", "."]);
  } else {
    const git = simpleGit({ maxConcurrentProcesses });
    try {
      if (repoInfo.subdir) {
        if (preserveGit) {
          await git.clone(finalUrl, projectPath, [
            "--branch",
            repoInfo.version,
          ]);
          await git.cwd(projectPath);
          await git.raw(["sparse-checkout", "init", "--cone"]);
          await git.raw(["sparse-checkout", "set", repoInfo.subdir]);
          const subdirPath = path.join(projectPath, repoInfo.subdir);
          if (!(await fs.pathExists(subdirPath))) {
            throw new Error(
              `Subdirectory '${repoInfo.subdir}' not found in repository ${repoURL}`,
            );
          }
          const files = await fs.readdir(subdirPath);
          for (const file of files) {
            await fs.move(
              path.join(subdirPath, file),
              path.join(projectPath, file),
              { overwrite: true },
            );
          }
          await fs.remove(subdirPath);
        } else {
          tempCloneDir = await fs.mkdtemp(path.join(parentDir, "gitclone-"));
          await git.clone(finalUrl, tempCloneDir, [
            "--branch",
            repoInfo.version,
            "--depth",
            "1",
            "--single-branch",
          ]);
          const srcSubdir = path.join(tempCloneDir, repoInfo.subdir);
          if (!(await fs.pathExists(srcSubdir))) {
            throw new Error(
              `Subdirectory '${repoInfo.subdir}' not found in repository ${repoURL}`,
            );
          }
          await fs.copy(srcSubdir, projectPath, {
            filter: (src) => !src.includes(`${path.sep}.git`),
          });
        }
      } else {
        const cloneOptions = ["--branch", repoInfo.version];
        if (!preserveGit) {
          cloneOptions.push("--depth", "1", "--single-branch");
        }
        await git.clone(finalUrl, projectPath, cloneOptions);
      }

      // 7) Post-clone adjustments
      if (!repoInfo.subdir) {
        if (!preserveGit) {
          await fs.remove(path.join(projectPath, ".git"));
          if (config) {
            relinka("info-verbose", "[D] initGitDir");
            await initGitDir({
              cwd,
              isDev,
              projectName,
              projectPath,
              allowReInit: true,
              createCommit: true,
              config,
              isTemplateDownload,
            });
          }
        } else {
          await setHiddenAttributeOnWindows(path.join(projectPath, ".git"));
        }
      } else {
        if (preserveGit) {
          await setHiddenAttributeOnWindows(path.join(projectPath, ".git"));
        }
      }
    } finally {
      if (tempCloneDir && (await fs.pathExists(tempCloneDir))) {
        await fs.remove(tempCloneDir);
      }
    }
  }

  // 8) Restore config if it was moved
  if (hasReliverseConfig) {
    await fs.move(projectReliverseConfigPath, projectReliverseConfigPath, {
      overwrite: true,
    });
  }

  // 9) Install dependencies if requested
  if (install) {
    relinka("info", "Installing dependencies...");
    await installDependencies({
      cwd: projectPath,
      silent: false,
    });
  }

  relinka("success-verbose", "Repository downloaded successfully!");
  const durationSeconds = (Date.now() - startTime) / 1000;
  const result: DownloadResult = { source: repoURL, dir: projectPath };
  if (returnTime) result.time = durationSeconds;
  if (returnSize) {
    const folderSizeBytes = await getFolderSize(
      projectPath,
      preserveGit ? [] : [".git"],
    );
    const sizeMB = parseFloat((folderSizeBytes / (1024 * 1024)).toFixed(2));
    result.size = sizeMB;
    result.sizePretty = prettyBytes(folderSizeBytes);
  }
  if (returnConcurrency) result.concurrency = maxConcurrentProcesses;
  return result;
}
