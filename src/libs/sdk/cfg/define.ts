import type { RseConfig } from "./cfg-types";

import { DEFAULT_CONFIG } from "./default";

export const defineConfig = (userConfig: Partial<RseConfig> = {}) => {
  return { ...DEFAULT_CONFIG, ...userConfig };
};
