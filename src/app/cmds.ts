// 👉 `dler rempts init --cmds`

export async function cmdAuthGenerate() {
  return (await import("./auth/generate/cmd")).default;
}
