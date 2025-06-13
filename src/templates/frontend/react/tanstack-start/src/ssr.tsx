// @ts-expect-error <<dler-remove-comment>>
import { getRouterManifest } from "@tanstack/react-start/router-manifest";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

// @ts-expect-error <dler-remove-comment>
import { createRouter } from "./router";

export default createStartHandler({
  createRouter, // @ts-expect-error <dler-remove-comment>
  getRouterManifest,
})(defaultStreamHandler);
