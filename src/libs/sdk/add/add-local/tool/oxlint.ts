import { relinka } from "@reliverse/relinka";

/**
 * @see https://oxc.rs/docs/guide/usage/linter.html
 */
export function useOxlintTool() {
  relinka(
    "info",
    "This integration is currently in development. Please check back later.",
  );
}
