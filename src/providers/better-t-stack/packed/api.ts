import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_API: Template = {
  name: "api",
  description: "Template generated from 13 files",
  updatedAt: "2025-06-17T20:33:59.544Z",
  config: {
    files: {
      "api/orpc/native/utils/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "911ac0411a",
        },
        content: `import { createORPCClient } from "@orpc/client";\nimport { RPCLink } from "@orpc/client/fetch";\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\nimport type { RouterClient } from "@orpc/server";\nimport { QueryCache, QueryClient } from "@tanstack/react-query";\nimport type { appRouter } from "../../server/src/routers";\n{{#if auth}}\nimport { authClient } from "@/lib/auth-client";\n{{/if}}\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      console.log(error)\n    },\n  }),\n});\n\nexport const link = new RPCLink({\n  url: \`\${process.env.EXPO_PUBLIC_SERVER_URL}/rpc\`,\n  {{#if auth}}\n  headers() {\n    const headers = new Map<string, string>();\n    const cookies = authClient.getCookie();\n    if (cookies) {\n      headers.set("Cookie", cookies);\n    }\n    return Object.fromEntries(headers);\n  },\n  {{/if}}\n});\n\nexport const client: RouterClient<typeof appRouter> = createORPCClient(link);\n\nexport const orpc = createTanstackQueryUtils(client);\n`,
        type: "text",
      },
      "api/orpc/server/base/src/lib/context.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "83bd3d8a84",
        },
        content: `{{#if (eq backend 'next')}}\nimport type { NextRequest } from "next/server";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext(req: NextRequest) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: req.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  return {}\n{{/if}}\n}\n\n{{else if (eq backend 'hono')}}\nimport type { Context as HonoContext } from "hono";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport type CreateContextOptions = {\n  context: HonoContext;\n};\n\nexport async function createContext({ context }: CreateContextOptions) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: context.req.raw.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else if (eq backend 'elysia')}}\nimport type { Context as ElysiaContext } from "elysia";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport type CreateContextOptions = {\n  context: ElysiaContext;\n};\n\nexport async function createContext({ context }: CreateContextOptions) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: context.request.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else if (eq backend 'express')}}\n{{#if auth}}\nimport { fromNodeHeaders } from "better-auth/node";\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext(opts: any) {\n{{#if auth}}\n	const session = await auth.api.getSession({\n		headers: fromNodeHeaders(opts.req.headers),\n	});\n	return {\n		session,\n	};\n{{else}}\n  // No auth configured\n	return {\n		session: null,\n	};\n{{/if}}\n}\n\n{{else if (eq backend 'fastify')}}\nimport type { IncomingHttpHeaders } from "node:http";\n{{#if auth}}\nimport { fromNodeHeaders } from "better-auth/node";\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext(req: IncomingHttpHeaders) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: fromNodeHeaders(req),\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else}}\nexport async function createContext() {\n  return {\n    session: null,\n  };\n}\n{{/if}}\n\nexport type Context = Awaited<ReturnType<typeof createContext>>;\n`,
        type: "text",
      },
      "api/orpc/server/base/src/lib/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3749886982",
        },
        content: `import { ORPCError, os } from "@orpc/server";\nimport type { Context } from "./context";\n\nexport const o = os.$context<Context>();\n\nexport const publicProcedure = o;\n\n{{#if auth}}\nconst requireAuth = o.middleware(async ({ context, next }) => {\n  if (!context.session?.user) {\n    throw new ORPCError("UNAUTHORIZED");\n  }\n  return next({\n    context: {\n      session: context.session,\n    },\n  });\n});\n\nexport const protectedProcedure = publicProcedure.use(requireAuth);\n{{/if}}\n`,
        type: "text",
      },
      "api/orpc/server/next/src/app/rpc/[...all]/route.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "cdf4279672",
        },
        content: `{{#if auth}}\nimport { createContext } from '@/lib/context'\n{{/if}}\nimport { appRouter } from '@/routers'\nimport { RPCHandler } from '@orpc/server/fetch'\nimport { NextRequest } from 'next/server'\n\nconst handler = new RPCHandler(appRouter)\n\nasync function handleRequest(req: NextRequest) {\n  const { response } = await handler.handle(req, {\n    prefix: '/rpc',\n    context: {{#if auth}}await createContext(req){{else}}{}{{/if}},\n  })\n\n  return response ?? new Response('Not found', { status: 404 })\n}\n\nexport const GET = handleRequest\nexport const POST = handleRequest\nexport const PUT = handleRequest\nexport const PATCH = handleRequest\nexport const DELETE = handleRequest\n`,
        type: "text",
      },
      "api/orpc/web/nuxt/app/plugins/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "77efd9809c",
        },
        content: `import { defineNuxtPlugin, useRuntimeConfig } from '#app'\nimport type { RouterClient } from '@orpc/server'\nimport type { appRouter } from "../../../server/src/routers/index";\nimport { createORPCClient } from '@orpc/client'\nimport { RPCLink } from '@orpc/client/fetch'\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\n\nexport default defineNuxtPlugin(() => {\n  const config = useRuntimeConfig()\n  const serverUrl = config.public.serverURL\n\n  const rpcUrl = \`\${serverUrl}/rpc\`;\n\n  const rpcLink = new RPCLink({\n    url: rpcUrl,\n    {{#if auth}}\n    fetch(url, options) {\n        return fetch(url, {\n        ...options,\n        credentials: "include",\n        });\n    },\n    {{/if}}\n  })\n\n\n  const client: RouterClient<typeof appRouter> = createORPCClient(rpcLink)\n  const orpcUtils = createTanstackQueryUtils(client)\n\n  return {\n    provide: {\n      orpc: orpcUtils\n    }\n  }\n})\n`,
        type: "text",
      },
      "api/orpc/web/react/base/src/utils/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "9ab6c8a4c0",
        },
        content: `import { createORPCClient } from "@orpc/client";\nimport { RPCLink } from "@orpc/client/fetch";\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\nimport { QueryCache, QueryClient } from "@tanstack/react-query";\nimport { toast } from "sonner";\nimport type { appRouter } from "../../../server/src/routers/index";\nimport type { RouterClient } from "@orpc/server";\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      toast.error(\`Error: \${error.message}\`, {\n        action: {\n          label: "retry",\n          onClick: () => {\n            queryClient.invalidateQueries();\n          },\n        },\n      });\n    },\n  }),\n});\n\nexport const link = new RPCLink({\n  {{#if (includes frontend "next")}}\n  url: \`\${process.env.NEXT_PUBLIC_SERVER_URL}/rpc\`,\n  {{else}}\n  url: \`\${import.meta.env.VITE_SERVER_URL}/rpc\`,\n  {{/if}}\n  {{#if auth}}\n  fetch(url, options) {\n    return fetch(url, {\n      ...options,\n      credentials: "include",\n    });\n  },\n  {{/if}}\n});\n\nexport const client: RouterClient<typeof appRouter> = createORPCClient(link)\n\nexport const orpc = createTanstackQueryUtils(client)\n`,
        type: "text",
      },
      "api/orpc/web/solid/src/utils/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "6d53d8cc60",
        },
        content: `import { createORPCClient } from "@orpc/client";\nimport { RPCLink } from "@orpc/client/fetch";\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\nimport { QueryCache, QueryClient } from "@tanstack/solid-query";\nimport type { appRouter } from "../../../server/src/routers/index";\nimport type { RouterClient } from "@orpc/server";\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      console.error(\`Error: \${error.message}\`);\n    },\n  }),\n});\n\nexport const link = new RPCLink({\n  url: \`\${import.meta.env.VITE_SERVER_URL}/rpc\`,\n  {{#if auth}}\n  fetch(url, options) {\n    return fetch(url, {\n      ...options,\n      credentials: "include",\n    });\n  },\n  {{/if}}\n});\n\nexport const client: RouterClient<typeof appRouter> = createORPCClient(link);\n\nexport const orpc = createTanstackQueryUtils(client);\n`,
        type: "text",
      },
      "api/orpc/web/svelte/src/lib/orpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "b8abb27944",
        },
        content: `import { PUBLIC_SERVER_URL } from "$env/static/public";\nimport { createORPCClient } from "@orpc/client";\nimport { RPCLink } from "@orpc/client/fetch";\nimport type { RouterClient } from "@orpc/server";\nimport { createTanstackQueryUtils } from "@orpc/tanstack-query";\nimport { QueryCache, QueryClient } from "@tanstack/svelte-query";\nimport type { appRouter } from "../../../server/src/routers/index";\n\nexport const queryClient = new QueryClient({\n	queryCache: new QueryCache({\n		onError: (error) => {\n			console.error(\`Error: \${error.message}\`);\n		},\n	}),\n});\n\nexport const link = new RPCLink({\n	url: \`\${PUBLIC_SERVER_URL}/rpc\`,\n	{{#if auth}}\n	fetch(url, options) {\n		return fetch(url, {\n			...options,\n			credentials: "include",\n		});\n	},\n	{{/if}}\n});\n\nexport const client: RouterClient<typeof appRouter> = createORPCClient(link);\n\nexport const orpc = createTanstackQueryUtils(client);\n`,
        type: "text",
      },
      "api/trpc/native/utils/trpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "ef6c8402a6",
        },
        content: `{{#if auth}}\nimport { authClient } from "@/lib/auth-client";\n{{/if}}\nimport { QueryClient } from "@tanstack/react-query";\nimport { createTRPCClient, httpBatchLink } from "@trpc/client";\nimport { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";\nimport type { AppRouter } from "../../server/src/routers";\n\nexport const queryClient = new QueryClient();\n\nconst trpcClient = createTRPCClient<AppRouter>({\n	links: [\n		httpBatchLink({\n			url: \`\${process.env.EXPO_PUBLIC_SERVER_URL}/trpc\`,\n			{{#if auth}}\n			headers() {\n				const headers = new Map<string, string>();\n				const cookies = authClient.getCookie();\n				if (cookies) {\n					headers.set("Cookie", cookies);\n				}\n				return Object.fromEntries(headers);\n			},\n			{{/if}}\n		}),\n	],\n});\n\nexport const trpc = createTRPCOptionsProxy<AppRouter>({\n	client: trpcClient,\n	queryClient,\n});\n`,
        type: "text",
      },
      "api/trpc/server/base/src/lib/context.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5c7ccd24ba",
        },
        content: `{{#if (eq backend 'next')}}\nimport type { NextRequest } from "next/server";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext(req: NextRequest) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: req.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else if (eq backend 'hono')}}\nimport type { Context as HonoContext } from "hono";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport type CreateContextOptions = {\n  context: HonoContext;\n};\n\nexport async function createContext({ context }: CreateContextOptions) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: context.req.raw.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else if (eq backend 'elysia')}}\nimport type { Context as ElysiaContext } from "elysia";\n{{#if auth}}\nimport { auth } from "./auth";\n{{/if}}\n\nexport type CreateContextOptions = {\n  context: ElysiaContext;\n};\n\nexport async function createContext({ context }: CreateContextOptions) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: context.request.headers,\n  });\n  return {\n    session,\n  };\n{{else}}\n  // No auth configured\n  return {\n    session: null,\n  };\n{{/if}}\n}\n\n{{else if (eq backend 'express')}}\nimport type { CreateExpressContextOptions } from "@trpc/server/adapters/express";\n{{#if auth}}\nimport { fromNodeHeaders } from "better-auth/node";\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext(opts: CreateExpressContextOptions) {\n{{#if auth}}\n	const session = await auth.api.getSession({\n		headers: fromNodeHeaders(opts.req.headers),\n	});\n	return {\n		session,\n	};\n{{else}}\n  // No auth configured\n	return {\n		session: null,\n	};\n{{/if}}\n}\n\n{{else if (eq backend 'fastify')}}\nimport type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";\n{{#if auth}}\nimport { fromNodeHeaders } from "better-auth/node";\nimport { auth } from "./auth";\n{{/if}}\n\nexport async function createContext({ req, res }: CreateFastifyContextOptions) {\n{{#if auth}}\n  const session = await auth.api.getSession({\n    headers: fromNodeHeaders(req.headers),\n  });\n  return { session };\n{{else}}\n  // No auth configured\n	return {\n		session: null,\n	};\n{{/if}}\n}\n\n{{else}}\nexport async function createContext() {\n  return {\n    session: null,\n  };\n}\n{{/if}}\n\nexport type Context = Awaited<ReturnType<typeof createContext>>;\n`,
        type: "text",
      },
      "api/trpc/server/base/src/lib/trpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f112e6ba22",
        },
        content: `import { initTRPC, TRPCError } from "@trpc/server";\nimport type { Context } from "./context";\n\nexport const t = initTRPC.context<Context>().create();\n\nexport const router = t.router;\n\nexport const publicProcedure = t.procedure;\n\n{{#if auth}}\nexport const protectedProcedure = t.procedure.use(({ ctx, next }) => {\n  if (!ctx.session) {\n    throw new TRPCError({\n      code: "UNAUTHORIZED",\n      message: "Authentication required",\n      cause: "No session",\n    });\n  }\n  return next({\n    ctx: {\n      ...ctx,\n      session: ctx.session,\n    },\n  });\n});\n{{/if}}\n`,
        type: "text",
      },
      "api/trpc/server/next/src/app/trpc/[trpc]/route.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1316017eae",
        },
        content: `import { fetchRequestHandler } from '@trpc/server/adapters/fetch';\nimport { appRouter } from '@/routers';\nimport { createContext } from '@/lib/context';\nimport { NextRequest } from 'next/server';\n\nfunction handler(req: NextRequest) {\n  return fetchRequestHandler({\n    endpoint: '/trpc',\n    req,\n    router: appRouter,\n    createContext: () => createContext(req)\n  });\n}\nexport { handler as GET, handler as POST };\n`,
        type: "text",
      },
      "api/trpc/web/react/base/src/utils/trpc.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "724dc936a4",
        },
        content: `{{#if (includes frontend 'next')}}\nimport { QueryCache, QueryClient } from '@tanstack/react-query';\nimport { createTRPCClient, httpBatchLink } from '@trpc/client';\nimport { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';\nimport type { AppRouter } from '../../../server/src/routers';\nimport { toast } from 'sonner';\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      toast.error(error.message, {\n        action: {\n          label: "retry",\n          onClick: () => {\n            queryClient.invalidateQueries();\n          },\n        },\n      });\n    },\n  }),\n});\n\nconst trpcClient = createTRPCClient<AppRouter>({\n  links: [\n    httpBatchLink({\n      {{#if (includes frontend 'next')}}\n      url: \`\${process.env.NEXT_PUBLIC_SERVER_URL}/trpc\`,\n      {{else}}\n      url: \`\${import.meta.env.VITE_SERVER_URL}/trpc\`,\n      {{/if}}\n      {{#if auth}}\n      fetch(url, options) {\n        return fetch(url, {\n          ...options,\n          credentials: "include",\n        });\n      },\n      {{/if}}\n    }),\n  ],\n})\n\nexport const trpc = createTRPCOptionsProxy<AppRouter>({\n  client: trpcClient,\n  queryClient,\n});\n\n{{else if (includes frontend 'tanstack-start')}}\nimport { createTRPCContext } from "@trpc/tanstack-react-query";\nimport type { AppRouter } from "../../../server/src/routers";\n\nexport const { TRPCProvider, useTRPC, useTRPCClient } =\n  createTRPCContext<AppRouter>();\n\n{{else}}\nimport type { AppRouter } from "../../../server/src/routers";\nimport { QueryCache, QueryClient } from "@tanstack/react-query";\nimport { createTRPCClient, httpBatchLink } from "@trpc/client";\nimport { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";\nimport { toast } from "sonner";\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({\n    onError: (error) => {\n      toast.error(error.message, {\n        action: {\n          label: "retry",\n          onClick: () => {\n            queryClient.invalidateQueries();\n          },\n        },\n      });\n    },\n  }),\n});\n\nexport const trpcClient = createTRPCClient<AppRouter>({\n  links: [\n    httpBatchLink({\n      url: \`\${import.meta.env.VITE_SERVER_URL}/trpc\`,\n      {{#if auth}}\n      fetch(url, options) {\n        return fetch(url, {\n          ...options,\n          credentials: "include",\n        });\n      },\n      {{/if}}\n    }),\n  ],\n});\n\nexport const trpc = createTRPCOptionsProxy<AppRouter>({\n  client: trpcClient,\n  queryClient,\n});\n{{/if}}\n`,
        type: "text",
      },
    },
  },
};
