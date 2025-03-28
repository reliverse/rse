import {
  selectPrompt,
  inputPrompt,
  confirmPrompt,
  multiselectPrompt,
} from "@reliverse/prompts";
import { relinka } from "@reliverse/prompts";

import type { ReliverseConfig } from "~/libs/cfg/constants/cfg-types.js";
import type { ReliverseMemory } from "~/libs/sdk/utils/schemaMemory.js";

import { getUserPkgManager } from "~/libs/sdk/utils/dependencies/getUserPkgManager.js";
import { handleDownload } from "~/libs/sdk/utils/downloading/handleDownload.js";
import { ensureGithubToken } from "~/libs/sdk/utils/instanceGithub.js";
import { askProjectName } from "~/libs/sdk/utils/prompts/askProjectName.js";
import { cd } from "~/libs/sdk/utils/terminalHelpers.js";

/**
 * Normalizes a GitHub repository URL to the format "owner/repo"
 */
function normalizeGitHubUrl(url: string): string {
  return url
    .trim()
    .replace(
      /^https?:\/\/(www\.)?(github|gitlab|bitbucket|sourcehut)\.com\//i,
      "",
    )
    .replace(/^(github|gitlab|bitbucket|sourcehut)\.com\//i, "")
    .replace(/\.git$/i, "");
}

/**
 * Data structure to hold the user's chosen repo and whether it was a custom entry.
 */
type RepoPromptResult = {
  repo: string;
  isCustom: boolean;
};

/**
 * Data structure to hold multiple chosen repos and whether they were custom entries.
 */
type MultiRepoPromptResult = {
  repos: string[];
  isCustomMap: Map<string, boolean>;
};

type MenuOption = {
  label: string;
  value: string;
  hint?: string;
};

/**
 * A collection of repository owners and their repositories
 */
const REPO_OWNERS = {
  blefnk: [
    "all-in-one-nextjs-template",
    "astro-starlight-template",
    "create-next-app",
    "create-t3-app",
    "relivator-nextjs-template",
    "versator-nextjs-template",
  ],
  reliverse: [
    "template-browser-extension",
    "acme",
    "cli",
    "pm",
    "prompts",
    "relico",
    "relinka",
  ],
  onwidget: ["astrowind"],
  "shadcn-ui": ["taxonomy"],
  "47ng": ["nuqs"],
  biomejs: ["biome"],
  pmndrs: ["zustand"],
  unjs: ["template"],
  "webpro-nl": ["knip"],
};

/**
 * Creates menu options for repositories based on the provided list,
 * owner, and configuration.
 */
function createMenuOptions(
  repos: string[],
  owner: string,
  config: ReliverseConfig,
): MenuOption[] {
  const customRepos = (config.customUserFocusedRepos ?? [])
    .concat(config.customDevsFocusedRepos ?? [])
    .map(normalizeGitHubUrl)
    .filter((repo) => repo.startsWith(`${owner}/`))
    .map((repo) => repo.split("/")[1])
    .filter((repo): repo is string => repo !== undefined);

  const allRepos =
    config.hideRepoSuggestions && customRepos.length > 0
      ? customRepos
      : [...repos, ...customRepos];

  if (!config.multipleRepoCloneMode) {
    return [
      {
        label: "📝 I want to provide a custom repository name",
        value: "custom",
      },
      ...allRepos.map(
        (repo): MenuOption => ({
          label: repo,
          value: repo,
          hint: customRepos.includes(repo) ? "custom" : undefined,
        }),
      ),
    ];
  }

  return allRepos.map(
    (repo): MenuOption => ({
      label: repo,
      value: repo,
      hint: customRepos.includes(repo) ? "custom" : undefined,
    }),
  );
}

/**
 * Prompts the user for a repository selection.
 */
async function promptForRepo({
  title,
  owner,
  options,
  config,
}: {
  title: string;
  owner: string;
  options: { label: string; value: string }[];
  config: ReliverseConfig;
}): Promise<RepoPromptResult | MultiRepoPromptResult> {
  if (config.multipleRepoCloneMode) {
    const selections = await multiselectPrompt({ title, options });
    if (selections.length === 0) {
      relinka("error", "Please select at least one repository.");
      return promptForRepo({ title, owner, options, config });
    }
    const isCustomMap = new Map<string, boolean>();
    const repos = selections.map((repo) => {
      const fullRepo = `${owner}/${repo}`;
      isCustomMap.set(fullRepo, false);
      return fullRepo;
    });
    return { repos, isCustomMap };
  } else {
    const selection = await selectPrompt({ title, options });
    if (selection === "custom") {
      const customRepo = await inputPrompt({
        title: `Enter a repository name for ${owner}`,
        content: `This will be combined as ${owner}/<your-input>`,
      });
      return { repo: `${owner}/${customRepo}`, isCustom: true };
    }
    return { repo: `${owner}/${selection}`, isCustom: false };
  }
}

/**
 * Helper function that handles the common steps for downloading a repository.
 * It prompts for privacy, dependency installation, project name, and Git history preference,
 * then downloads the repository.
 */
async function downloadAndSetupRepo(
  owner: string,
  repoFullName: string,
  config: ReliverseConfig,
  memory: ReliverseMemory,
  isDev: boolean,
  cwd: string,
  isCustom: boolean,
): Promise<void> {
  // Check repository privacy if it's not one of the predefined repos
  let privacy: "public" | "private" = "public";
  // @ts-expect-error TODO: fix ts
  if (!REPO_OWNERS[owner]?.includes(repoFullName.split("/")[1])) {
    privacy = await selectPrompt({
      title: `Is repo ${repoFullName} public or private?`,
      options: [
        { label: "Public", value: "public" },
        { label: "Private", value: "private" },
      ],
    });
  }

  const { packageManager } = await getUserPkgManager();
  let shouldInstallDeps = false;
  if (!isDev) {
    shouldInstallDeps = await confirmPrompt({
      title: "Do you want me to install dependencies?",
      content: `I can run "${packageManager} install" in the directory of the cloned repo.`,
    });
  }

  const projectName = await askProjectName({ repoName: repoFullName });
  const gitPreference = await selectPrompt({
    title: "How would you like to handle Git history?",
    content: `(project: ${projectName} | repo: ${repoFullName})`,
    options: [
      {
        label: "Preserve original Git history",
        hint: "keeps the original .git folder",
        value: "preserve",
      },
      {
        label: "Start fresh Git history",
        hint: "initializes a new .git folder",
        value: "fresh",
      },
    ],
  });

  let githubToken = "";
  if (privacy === "private") {
    githubToken = await ensureGithubToken(memory, "prompt");
  }

  const { source, dir } = await handleDownload({
    cwd,
    isDev,
    skipPrompts: false,
    projectPath: "",
    projectName,
    selectedRepo: repoFullName,
    githubToken,
    preserveGit: gitPreference === "preserve",
    config: gitPreference === "fresh" ? config : undefined,
    install: shouldInstallDeps,
    isCustom,
    isTemplateDownload: false,
    cache: false,
  });

  relinka("success", `🎉 ${source} was downloaded to ${dir}`);
}

/**
 * Main function to show the clone project menu and handle user selection.
 */
export async function showCloneProjectMenu({
  isDev,
  cwd,
  config,
  memory,
}: {
  isDev: boolean;
  cwd: string;
  config: ReliverseConfig;
  memory: ReliverseMemory;
}) {
  if (isDev) {
    await cd("tests-runtime");
  }

  relinka(
    "success",
    "Please note: This menu only allows cloning repositories.",
    "If you want a fully personalized project bootstrapped with a desired template, re-run the CLI and choose the `✨ Create a brand new project` option instead.",
  );

  // Prompt for the repository owner.
  const ownerOptions = [
    ...Object.keys(REPO_OWNERS).map((owner) => ({
      label: owner,
      value: owner,
    })),
    { label: "📝 Enter a custom owner", value: "custom" },
    { label: "👈 Exit", value: "exit" },
  ];

  const selectedOwner = await selectPrompt({
    title: "Select or enter a repository owner",
    options: ownerOptions,
  });

  if (selectedOwner === "exit") {
    relinka("info", "Exiting without cloning any repository.");
    return;
  }

  const owner =
    selectedOwner === "custom"
      ? await inputPrompt({
          title: "Enter the GitHub username or organization",
        })
      : selectedOwner;

  // Get repository suggestions for the owner.
  const ownerRepos = REPO_OWNERS[owner as keyof typeof REPO_OWNERS] || [];
  const repoPromptResult = await promptForRepo({
    title: `Select repositories from ${owner}`,
    owner,
    options: createMenuOptions(ownerRepos, owner, config),
    config,
  });

  // Download each selected repository.
  if ("repos" in repoPromptResult) {
    for (const repo of repoPromptResult.repos) {
      await downloadAndSetupRepo(
        owner,
        repo,
        config,
        memory,
        isDev,
        cwd,
        repoPromptResult.isCustomMap.get(repo) || false,
      );
    }
  } else {
    await downloadAndSetupRepo(
      owner,
      repoPromptResult.repo,
      config,
      memory,
      isDev,
      cwd,
      repoPromptResult.isCustom,
    );
  }
}
