import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
    },
    watch: false,
  },
});
