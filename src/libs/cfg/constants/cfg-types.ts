import type { Static } from "@sinclair/typebox";

import type { reliverseConfigSchema } from "./cfg-schema.js";

export type ReliverseConfig = Static<typeof reliverseConfigSchema>;

export type ProjectCategory = Exclude<
  ReliverseConfig["projectCategory"],
  undefined
>;

export type ProjectSubcategory = Exclude<
  ReliverseConfig["projectSubcategory"],
  undefined
>;

export type ProjectFramework = Exclude<
  ReliverseConfig["projectFramework"],
  undefined
>;

export type ProjectArchitecture = Exclude<
  ReliverseConfig["projectArchitecture"],
  undefined
>;

export type RelinterConfirm = Exclude<
  ReliverseConfig["relinterConfirm"],
  undefined
>;
