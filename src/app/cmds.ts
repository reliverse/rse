// 👉 `dler rempts init --cmds`

export async function cmdAuthGenerate() {
  // @ts-expect-error TODO: temp
  return (await import("./auth/generate/cmd.js")).default;
}
