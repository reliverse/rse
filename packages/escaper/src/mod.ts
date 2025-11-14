import { statSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

export interface EscapeArgs {
  input: string;
  map?: string;
  recursive?: boolean;
  unescape?: boolean;
}

interface FileMapping {
  format: string;
  patterns: string[];
}

function escapeContent(content: string): string {
  return content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${");
}

function unescapeContent(content: string): string {
  return content
    .replace(/\\\${/g, "${")
    .replace(/\\`/g, "`")
    .replace(/\\\\/g, "\\");
}

function extractContentFromTs(tsContent: string): string {
  const prefix = "export const content = `";
  const prefixIndex = tsContent.indexOf(prefix);
  if (prefixIndex === -1) {
    throw new Error(
      "Invalid escaped file format: expected 'export const content = `...`;'",
    );
  }

  const contentStart = prefixIndex + prefix.length;
  let contentEnd = tsContent.length;

  for (let i = contentEnd - 1; i >= contentStart; i--) {
    if (tsContent[i] === "`") {
      const beforeBacktick = tsContent[i - 1];
      if (beforeBacktick !== "\\") {
        contentEnd = i;
        break;
      }
      let backslashCount = 0;
      for (let j = i - 1; j >= contentStart && tsContent[j] === "\\"; j--) {
        backslashCount++;
      }
      if (backslashCount % 2 === 0) {
        contentEnd = i;
        break;
      }
    }
  }

  if (contentEnd === tsContent.length) {
    throw new Error(
      "Invalid escaped file format: could not find closing backtick",
    );
  }

  return tsContent.slice(contentStart, contentEnd);
}

export function parseMap(mapString: string): FileMapping[] {
  const mappings: FileMapping[] = [];
  const parts = mapString.trim().split(/\s+/);

  for (const part of parts) {
    const [format, files] = part.split(":", 2);
    if (!format || !files) continue;

    const patterns = files
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    mappings.push({ format, patterns });
  }

  return mappings;
}

export async function findFiles(
  inputPath: string,
  mappings: FileMapping[] | null,
  recursive: boolean,
): Promise<string[]> {
  const files: string[] = [];
  const inputStat = statSync(inputPath);

  if (inputStat.isFile()) {
    return [inputPath];
  }

  if (!inputStat.isDirectory()) {
    throw new Error(
      `Input path is neither a file nor a directory: ${inputPath}`,
    );
  }

  const defaultExtensions = [".md", ".mdc", ".mdx", ".json", ".jsonc", ".toml"];

  async function walkDir(dir: string, baseDir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          await walkDir(fullPath, baseDir);
        }
      } else if (entry.isFile()) {
        let shouldInclude = false;

        // Always check default extensions
        const ext = extname(entry.name);
        if (defaultExtensions.includes(ext)) {
          shouldInclude = true;
        }

        // Check custom mappings if provided (additive to defaults)
        if (mappings) {
          for (const mapping of mappings) {
            for (const pattern of mapping.patterns) {
              if (pattern === "*") {
                const expectedExt = mapping.format.startsWith(".")
                  ? mapping.format
                  : `.${mapping.format}`;
                if (ext === expectedExt) {
                  shouldInclude = true;
                  break;
                }
              } else if (pattern.startsWith("*.")) {
                const patternExt = pattern.slice(1);
                const expectedExt = patternExt.startsWith(".")
                  ? patternExt
                  : `.${patternExt}`;
                if (ext === expectedExt) {
                  shouldInclude = true;
                  break;
                }
              } else {
                const patternPath = join(baseDir, pattern);
                const normalizedPattern = resolve(patternPath);
                const normalizedFull = resolve(fullPath);
                if (normalizedFull === normalizedPattern) {
                  shouldInclude = true;
                  break;
                }
              }
            }
            if (shouldInclude) break;
          }
        }

        if (shouldInclude) {
          files.push(fullPath);
        }
      }
    }
  }

  await walkDir(inputPath, inputPath);
  return files;
}

export async function findEscapedFiles(
  inputPath: string,
  recursive: boolean,
): Promise<string[]> {
  const files: string[] = [];
  const inputStat = statSync(inputPath);

  if (inputStat.isFile()) {
    if (extname(inputPath) === ".ts") {
      return [inputPath];
    }
    return [];
  }

  if (!inputStat.isDirectory()) {
    throw new Error(
      `Input path is neither a file nor a directory: ${inputPath}`,
    );
  }

  async function walkDir(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          await walkDir(fullPath);
        }
      } else if (entry.isFile() && extname(entry.name) === ".ts") {
        files.push(fullPath);
      }
    }
  }

  await walkDir(inputPath);
  return files;
}

export function getOutputPath(
  inputPath: string,
  filePath: string,
  isDirectory: boolean,
): string {
  if (isDirectory) {
    const inputDir = dirname(inputPath);
    const inputName = basename(inputPath);
    const outputDir = join(inputDir, `${inputName}-escaped`);
    const relPath = relative(inputPath, filePath);
    const outputFile = join(outputDir, relPath);
    return `${outputFile}.ts`;
  }

  return `${inputPath}.ts`;
}

export function getUnescapeOutputPath(
  inputPath: string,
  filePath: string,
  isDirectory: boolean,
): string {
  if (isDirectory) {
    const inputName = basename(inputPath);
    const inputDir = dirname(inputPath);
    let outputDirName: string;

    if (inputName.endsWith("-escaped")) {
      const originalName = inputName.slice(0, -8);
      outputDirName = `${originalName}-unescaped`;
    } else {
      outputDirName = `${inputName}-unescaped`;
    }

    const outputDir = join(inputDir, outputDirName);
    const relPath = relative(inputPath, filePath);
    const outputFile = join(outputDir, relPath);
    return outputFile.slice(0, -3);
  }

  const outputName = basename(inputPath, ".ts");
  return join(dirname(inputPath), outputName);
}

export async function convertFile(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const content = await readFile(inputPath, "utf-8");
  const escaped = escapeContent(content);
  const tsContent = `export const content = \`${escaped}\`;\n`;

  const outputDir = dirname(outputPath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, tsContent, "utf-8");
}

export async function unconvertFile(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const tsContent = await readFile(inputPath, "utf-8");
  const escapedContent = extractContentFromTs(tsContent);
  const content = unescapeContent(escapedContent);

  const outputDir = dirname(outputPath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, content, "utf-8");
}
