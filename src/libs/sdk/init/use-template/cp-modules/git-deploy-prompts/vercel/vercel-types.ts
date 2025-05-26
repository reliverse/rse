import type { CreateProjectEnv2Target } from "@vercel/sdk/models/createprojectenvop";
import type { CreateProjectEnv2Type } from "@vercel/sdk/models/createprojectenvop";
import type { GetProjectsFramework } from "@vercel/sdk/models/getprojectsop";

export type VercelFramework = GetProjectsFramework;

export interface VercelDeploymentConfig {
  framework: VercelFramework | null;
  rootDirectory?: string | null;
  buildCommand?: string | null;
  outputDirectory?: string | null;
  devCommand?: string | null;
  installCommand?: string | null;
}

export type DeploymentLogType = "error" | "warning" | "info" | "debug";

export interface DeploymentLog {
  type: DeploymentLogType;
  created: number;
  text: string;
}

export interface EnvVar {
  key: string;
  value: string;
  type: CreateProjectEnv2Type;
  target?: CreateProjectEnv2Target[];
}

export interface DeploymentOptions {
  options: string[];
  useSharedEnvVars: boolean;
  sharedEnvVarsProduction?: boolean;
}
