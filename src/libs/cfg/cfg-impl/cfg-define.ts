import type { RseConfig } from "./cfg-types";

import { DEFAULT_CONFIG_RSE } from "./cfg-default";

export const defineConfig = (userConfig: Partial<RseConfig> = {}) => {
  return { ...DEFAULT_CONFIG_RSE, ...userConfig };
};
