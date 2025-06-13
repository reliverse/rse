import type { NextRequest } from "next/server";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// @ts-expect-error <dler-remove-comment>
import { createContext } from "~/lib/context";
// @ts-expect-error <dler-remove-comment>
import { appRouter } from "~/routers";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });
}
export { handler as GET, handler as POST };
