#!/usr/bin/env bun

// 👉 bun rse <cmd> <args>
// 💡 rse === cli/src/cli.ts

import { runLauncher } from "@reliverse/dler-launcher";

await runLauncher(import.meta.url, { verbose: false });
