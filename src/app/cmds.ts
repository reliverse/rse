// 👉 `dler rempts init --cmds`

import { loadCommand } from "@reliverse/rempts";

export const getWebCmd = async () => await loadCommand("./web/cmd");

export const getAuthCmd = async () => await loadCommand("./auth/cmd");

export const getAuthGenerateCmd = async () =>
  await loadCommand("./auth/generate/cmd");
