export type PackageInfo = {
  name: string;
  workspace: string;
  scope: string;
};

export type MonorepoConfig = {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  packages: PackageInfo[];
  rootPath: string;
};

export type CatalogDependency = {
  name: string;
  version: string;
};

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

// Integration types (merged from add/types.ts)
export interface IntegrationContext {
  targetPath: string;
  isMonorepo: boolean;
  monorepoRoot?: string;
  packageName?: string;
  verbose: boolean;
  tempDir: TempDirectory;
}

export interface Integration {
  name: string;
  description: string;
  dependencies: string[];
  devDependencies: string[];

  // Lifecycle hooks
  validate(context: IntegrationContext): Promise<boolean>;
  install(context: IntegrationContext): Promise<void>;
  configure(context: IntegrationContext): Promise<void>;
  postInstall(context: IntegrationContext): Promise<void>;
}

export interface ProjectContext {
  type: "monorepo" | "single-repo";
  rootPath: string;
  targetPath: string;
  packages?: DetectedPackageInfo[];
  selectedPackage?: DetectedPackageInfo;
}

export interface DetectedPackageInfo {
  name: string;
  path: string;
  packageJson: any;
}

export interface BiomeConfig {
  path: string;
  exists: boolean;
  content?: any;
}

export interface TempDirectory {
  path: string;
  cleanup: () => Promise<void>;
}

// Integration target configuration
export interface IntegrationTarget {
  integrationName: string;
  targetPath: string;
  packageName?: string;
  isRoot: boolean;
}

export interface IntegrationConfig {
  integrations: string[];
  targets: IntegrationTarget[];
}
