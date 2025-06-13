import fs from "@reliverse/relifso";
import path from "path";

export function stripJsonComments(jsonString: string): string {
  return jsonString
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) =>
      g ? "" : m,
    )
    .replace(/,(?=\s*[}\]])/g, "");
}
export async function getTsconfigInfo(cwd?: string, flatPath?: string) {
  let tsConfigPath: string;
  if (flatPath) {
    tsConfigPath = flatPath;
  } else {
    tsConfigPath = cwd
      ? path.join(cwd, "tsconfig.json")
      : path.join("tsconfig.json");
  }
  const text = await fs.readFile(tsConfigPath, "utf-8");
  return JSON.parse(stripJsonComments(text));
}
