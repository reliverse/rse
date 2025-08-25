export interface CommonArgs {
  ci: boolean;
  dev: boolean;
}

export type CmdName = "rse" | "build" | "publish" | "deploy" | "native" | "update";
