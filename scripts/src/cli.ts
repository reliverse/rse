#!/usr/bin/env bun

// 👉 bun scripts <cmd> <args>
// 💡 scripts === scripts/src/cli.ts

import { runLauncher } from "@reliverse/dler-launcher";

await runLauncher(import.meta.url, { verbose: false });
