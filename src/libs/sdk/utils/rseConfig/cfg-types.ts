import type { Static } from "@sinclair/typebox";

import type { rseSchema } from "./cfg-schema.js";

export type RseConfig = Static<typeof rseSchema>;

export type ProjectCategory = Exclude<RseConfig["projectCategory"], undefined>;

export type ProjectSubcategory = Exclude<
  RseConfig["projectSubcategory"],
  undefined
>;

export type ProjectFramework = Exclude<
  RseConfig["projectFramework"],
  undefined
>;

export type ProjectArchitecture = Exclude<
  RseConfig["projectArchitecture"],
  undefined
>;

export type RelinterConfirm = Exclude<RseConfig["relinterConfirm"], undefined>;
