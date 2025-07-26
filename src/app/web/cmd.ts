import { defineCommand } from "@reliverse/rempts";
import { $ } from "bun";

export default defineCommand({
  meta: {
    name: "web",
    description: "Start the rse web ui",
  },
  async run() {
    // TODO: download the rse-web tauri binary
    await $`bunx @reliverse/get rse-web`;
  },
});
