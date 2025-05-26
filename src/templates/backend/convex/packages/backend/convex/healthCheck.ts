// @ts-expect-error dler-remove-this-comment
import { query } from "./_generated/server";

export const get = query({
  handler: async () => {
    return "OK";
  },
});
