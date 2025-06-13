import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler,
  // @ts-expect-error <dler-remove-comment>
} from "@tanstack/react-start/api";

export default createStartAPIHandler(defaultAPIFileRouteHandler);
