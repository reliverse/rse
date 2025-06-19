import { DLER_TPL_ADDONS } from "./packed/addons";
import { DLER_TPL_API } from "./packed/api";
import { DLER_TPL_AUTH } from "./packed/auth";
import { DLER_TPL_BACKEND } from "./packed/backend";
import { DLER_TPL_BASE } from "./packed/base";
import { DLER_TPL_DB } from "./packed/db";
import { DLER_TPL_EXAMPLES } from "./packed/examples";
import { DLER_TPL_EXTRAS } from "./packed/extras";
import { DLER_TPL_FRONTEND } from "./packed/frontend";
import { DLER_TPL_RUNTIME } from "./packed/runtime";

const DLER_TEMPLATES_OBJ = {
  addons: DLER_TPL_ADDONS,
  api: DLER_TPL_API,
  auth: DLER_TPL_AUTH,
  backend: DLER_TPL_BACKEND,
  base: DLER_TPL_BASE,
  db: DLER_TPL_DB,
  examples: DLER_TPL_EXAMPLES,
  extras: DLER_TPL_EXTRAS,
  frontend: DLER_TPL_FRONTEND,
  runtime: DLER_TPL_RUNTIME,
};

export const DLER_TEMPLATES = DLER_TEMPLATES_OBJ;

export type DLER_TEMPLATE_NAMES = keyof typeof DLER_TEMPLATES;

export const dlerTemplatesMap: Record<string, DLER_TEMPLATE_NAMES> = {
  DLER_TPL_ADDONS: "addons",
  DLER_TPL_API: "api",
  DLER_TPL_AUTH: "auth",
  DLER_TPL_BACKEND: "backend",
  DLER_TPL_BASE: "base",
  DLER_TPL_DB: "db",
  DLER_TPL_EXAMPLES: "examples",
  DLER_TPL_EXTRAS: "extras",
  DLER_TPL_FRONTEND: "frontend",
  DLER_TPL_RUNTIME: "runtime",
};
