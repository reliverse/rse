export type ArgType = string | number | boolean | string[] | undefined;

export interface CommonArgs {
  isCI: boolean;
  isDev: boolean;
  strCwd: string;
}

export type CmdName =
  | "rse"
  | "build"
  | "publish"
  | "deploy"
  | "native"
  | "update"
  | "agg"
  | "upgrade";
