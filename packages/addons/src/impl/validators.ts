import type { ValidationResult } from "./types";

export const validatePackageName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Package name cannot be empty" };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      valid: false,
      error:
        "Package name must contain only lowercase letters, numbers, and hyphens",
    };
  }

  if (name.startsWith("-") || name.endsWith("-")) {
    return {
      valid: false,
      error: "Package name cannot start or end with a hyphen",
    };
  }

  return { valid: true };
};

export const validateMonorepoName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Monorepo name cannot be empty" };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      valid: false,
      error:
        "Monorepo name must contain only lowercase letters, numbers, and hyphens",
    };
  }

  return { valid: true };
};

export const validateVersion = (version: string): ValidationResult => {
  if (!version || version.trim().length === 0) {
    return { valid: false, error: "Version cannot be empty" };
  }

  if (!/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/.test(version)) {
    return {
      valid: false,
      error: "Version must follow semantic versioning (e.g., 1.0.0)",
    };
  }

  return { valid: true };
};
