import { relinka } from "@reliverse/relinka";
import { execa } from "execa";

export async function openUrl(url: string): Promise<void> {
  const platform = process.platform;
  let command: string;
  let args: string[] = [];

  if (platform === "darwin") {
    command = "open";
    args = [url];
  } else if (platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", url.replace(/&/g, "^&")];
  } else {
    command = "xdg-open";
    args = [url];
  }

  try {
    await execa(command, args, { stdio: "ignore" });
  } catch {
    relinka("info", `Please open ${url} in your browser.`);
  }
}
