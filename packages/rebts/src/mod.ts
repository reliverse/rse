import { createProjectHandler } from "./impl/helpers/core/command-handlers";

import type {
  API,
  AddInput,
  Addons,
  Backend,
  BetterTStackConfig,
  CreateInput,
  Database,
  DatabaseSetup,
  DirectoryConflict,
  Examples,
  Frontend,
  InitResult,
  ORM,
  PackageManager,
  ProjectConfig,
  Runtime,
  ServerDeploy,
  WebDeploy
} from "./impl/types";

export async function init(projectName?: string, options?: CreateInput) {
	const opts = (options ?? {}) as CreateInput;
	const programmaticOpts = { ...opts, verbose: true };
	
	return result as InitResult;
}

export type {
	Database,
	ORM,
	Backend,
	Runtime,
	Frontend,
	Addons,
	Examples,
	PackageManager,
	DatabaseSetup,
	API,
	WebDeploy,
	ServerDeploy,
	DirectoryConflict,
	CreateInput,
	AddInput,
	ProjectConfig,
	BetterTStackConfig,
	InitResult,
};
