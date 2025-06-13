/* eslint-disable @typescript-eslint/no-unused-vars */ // <dler-remove-line>

import { createAuthClient } from "better-auth/vue";

// @ts-expect-error <dler-remove-comment>
export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error <dler-remove-comment>
  const config = useRuntimeConfig();
  const serverUrl = config.public.serverURL;

  const authClient = createAuthClient({
    baseURL: serverUrl,
  });

  return {
    provide: {
      authClient: authClient,
    },
  };
});
