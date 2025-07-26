/* ------------------------------------------------------------------
 * Injection Helpers
 * ------------------------------------------------------------------
 */

import MagicString from "magic-string";

import type { RseConfig } from "./cfg-types";

import { cliDomainDocs } from "./cfg-consts";

export function injectSectionComments(fileContent: string): string {
  const ms = new MagicString(fileContent);
  const comment = (text: string) => (text ? `// ${text}` : "");
  const commentSections: Partial<Record<keyof RseConfig, string[]>> = {
    $schema: [
      comment(`RSE CONFIG (${cliDomainDocs})`),
      comment("Restart the CLI to apply your config changes"),
    ],
    projectName: [comment("General project information")],
    skipPromptsUseAutoBehavior: [
      comment(
        "Enable auto-answering for prompts to skip manual confirmations.",
      ),
      comment("Make sure you have unknown values configured above."),
    ],
    features: [comment("Project features")],
    projectFramework: [comment("Primary tech stack/framework")],
    codeStyle: [comment("Code style preferences")],
    multipleRepoCloneMode: [comment("Settings for cloning an existing repo")],
    envComposerOpenBrowser: [
      comment(
        "Set to false to disable opening the browser during env composing",
      ),
    ],
    ignoreDependencies: [comment("List dependencies to exclude from checks")],
    customRules: [
      comment("Provide custom rules for Reliverse AI"),
      comment("You can use any json type here in {}"),
    ],
    deployBehavior: [
      comment("Prompt behavior for deployment"),
      comment("Options: prompt | autoYes | autoNo"),
    ],
    existingRepoBehavior: [
      comment("Behavior for existing GitHub repos during project creation"),
      comment("Options: prompt | autoYes | autoYesSkipCommit | autoNo"),
    ],
    relinterConfirm: [
      comment("Behavior for Reliverse AI chat and agent mode"),
      comment("Options: promptOnce | promptEachFile | autoYes"),
    ],
  };

  // For each section, find matches in the original file content
  for (const [section, lines] of Object.entries(commentSections)) {
    if (!lines?.length) continue;
    const combinedComments = lines
      .map((line, idx) => (idx === 0 ? line : `  ${line}`))
      .join("\n");
    const regex = new RegExp(
      `(\\s+)(["']?)${section.replace("$", "\\$")}(\\2):`,
      "g",
    );
    let match: RegExpExecArray | null = regex.exec(fileContent);
    while (match !== null) {
      const insertPos = match.index;
      // Insert a newline before the comment block
      const insertion = `\n\n  ${combinedComments}`;
      ms.prependLeft(insertPos, insertion);
      match = regex.exec(fileContent);
    }
  }

  let result = ms.toString();
  result = result
    .replace(/\n{3,}/g, "\n\n")
    .replace(/{\n\n/g, "{\n")
    .replace(/\n\n}/g, "\n}");
  return result.trim().concat("\n");
}
