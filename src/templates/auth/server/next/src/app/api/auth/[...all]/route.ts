import { toNextJsHandler } from "better-auth/next-js";

// @ts-expect-error <dler-remove-comment>
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth.handler);
