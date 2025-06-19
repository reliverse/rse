import type { TSConfig } from "pkg-types";

import type { Template } from "~/providers/better-t-stack/better-t-stack-types.ts";

export const DLER_TPL_BACKEND: Template = {
  name: "backend",
  description: "Template generated from 21 files",
  updatedAt: "2025-06-17T20:33:59.618Z",
  config: {
    files: {
      "backend/convex/packages/backend/convex/healthCheck.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "4e85265190",
        },
        content: `import { query } from "./_generated/server";\n\nexport const get = query({\n  handler: async () => {\n    return "OK";\n  }\n})\n`,
        type: "text",
      },
      "backend/convex/packages/backend/convex/README.md": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d261559702",
        },
        content: `# Welcome to your Convex functions directory!\n\nWrite your Convex functions here.\nSee https://docs.convex.dev/functions for more.\n\nA query function that takes two arguments looks like:\n\n\`\`\`ts\n// functions.js\nimport { query } from "./_generated/server";\nimport { v } from "convex/values";\n\nexport const myQueryFunction = query({\n  // Validators for arguments.\n  args: {\n    first: v.number(),\n    second: v.string(),\n  },\n\n  // Function implementation.\n  handler: async (ctx, args) => {\n    // Read the database as many times as you need here.\n    // See https://docs.convex.dev/database/reading-data.\n    const documents = await ctx.db.query("tablename").collect();\n\n    // Arguments passed from the client are properties of the args object.\n    console.log(args.first, args.second);\n\n    // Write arbitrary JavaScript here: filter, aggregate, build derived data,\n    // remove non-public properties, or create new objects.\n    return documents;\n  },\n});\n\`\`\`\n\nUsing this query function in a React component looks like:\n\n\`\`\`ts\nconst data = useQuery(api.functions.myQueryFunction, {\n  first: 10,\n  second: "hello",\n});\n\`\`\`\n\nA mutation function looks like:\n\n\`\`\`ts\n// functions.js\nimport { mutation } from "./_generated/server";\nimport { v } from "convex/values";\n\nexport const myMutationFunction = mutation({\n  // Validators for arguments.\n  args: {\n    first: v.string(),\n    second: v.string(),\n  },\n\n  // Function implementation.\n  handler: async (ctx, args) => {\n    // Insert or modify documents in the database here.\n    // Mutations can also read from the database like queries.\n    // See https://docs.convex.dev/database/writing-data.\n    const message = { body: args.first, author: args.second };\n    const id = await ctx.db.insert("messages", message);\n\n    // Optionally, return a value from your mutation.\n    return await ctx.db.get(id);\n  },\n});\n\`\`\`\n\nUsing this mutation function in a React component looks like:\n\n\`\`\`ts\nconst mutation = useMutation(api.functions.myMutationFunction);\nfunction handleButtonPress() {\n  // fire and forget, the most common way to use mutations\n  mutation({ first: "Hello!", second: "me" });\n  // OR\n  // use the result once the mutation has completed\n  mutation({ first: "Hello!", second: "me" }).then((result) =>\n    console.log(result),\n  );\n}\n\`\`\`\n\nUse the Convex CLI to push your functions to a deployment. See everything\nthe Convex CLI can do by running \`npx convex -h\` in your project root\ndirectory. To learn more, launch the docs with \`npx convex docs\`.\n`,
        type: "text",
      },
      "backend/convex/packages/backend/convex/schema.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "8415cc5ad3",
        },
        content: `import { defineSchema, defineTable } from "convex/server";\nimport { v } from "convex/values";\n\nexport default defineSchema({\n  todos: defineTable({\n    text: v.string(),\n    completed: v.boolean(),\n  }),\n});\n`,
        type: "text",
      },
      "backend/convex/packages/backend/convex/todos.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0e64275cf0",
        },
        content: `import { query, mutation } from "./_generated/server";\nimport { v } from "convex/values";\n\nexport const getAll = query({\n  handler: async (ctx) => {\n    return await ctx.db.query("todos").collect();\n  },\n});\n\nexport const create = mutation({\n  args: {\n    text: v.string(),\n  },\n  handler: async (ctx, args) => {\n    const newTodoId = await ctx.db.insert("todos", {\n      text: args.text,\n      completed: false,\n    });\n    return await ctx.db.get(newTodoId);\n  },\n});\n\nexport const toggle = mutation({\n  args: {\n    id: v.id("todos"),\n    completed: v.boolean(),\n  },\n  handler: async (ctx, args) => {\n    await ctx.db.patch(args.id, { completed: args.completed });\n    return { success: true };\n  },\n});\n\nexport const deleteTodo = mutation({\n  args: {\n    id: v.id("todos"),\n  },\n  handler: async (ctx, args) => {\n    await ctx.db.delete(args.id);\n    return { success: true };\n  },\n});\n`,
        type: "text",
      },
      "backend/convex/packages/backend/convex/tsconfig.json": {
        jsonComments: {
          "2": "  /* This TypeScript project config describes the environment that",
          "7": "    /* These settings are not required by Convex and can be modified. */",
          "15": "    /* These compiler options are required by Convex */",
        },
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "3f3d4096f8",
        },
        content: {
          compilerOptions: {
            allowJs: true,
            strict: true,
            moduleResolution: "Bundler",
            jsx: "react-jsx",
            skipLibCheck: true,
            allowSyntheticDefaultImports: true,
            target: "ESNext",
            lib: ["ES2021", "dom"],
            forceConsistentCasingInFileNames: true,
            module: "ESNext",
            isolatedModules: true,
            noEmit: true,
          },
          include: ["./**/*"],
          exclude: ["./_generated"],
        } satisfies TSConfig,
        type: "json",
      },
      "backend/convex/packages/backend/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "a31c4f0f85",
        },
        content: `{\n  "name": "@{{projectName}}/backend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "convex dev",\n    "setup": "convex dev --configure --until-success"\n  },\n  "author": "",\n  "license": "ISC",\n  "description": "",\n  "devDependencies": {\n    "typescript": "^5.8.3"\n  },\n  "dependencies": {\n    "convex": "^1.23.0"\n  }\n}\n`,
        type: "text",
      },
      "backend/convex/packages/backend/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "5e859410e4",
        },
        content: `\n.env.local\n`,
        type: "text",
      },
      "backend/server/elysia/src/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7b173395c4",
        },
        content: `import "dotenv/config";\n{{#if (eq runtime "node")}}\nimport { node } from "@elysiajs/node";\n{{/if}}\nimport { Elysia } from "elysia";\nimport { cors } from "@elysiajs/cors";\n{{#if (eq api "trpc")}}\nimport { createContext } from "./lib/context";\nimport { appRouter } from "./routers/index";\nimport { fetchRequestHandler } from "@trpc/server/adapters/fetch";\n{{/if}}\n{{#if (eq api "orpc")}}\nimport { RPCHandler } from "@orpc/server/fetch";\nimport { appRouter } from "./routers";\nimport { createContext } from "./lib/context";\n{{/if}}\n{{#if auth}}\nimport { auth } from "./lib/auth";\n{{/if}}\n\n{{#if (eq api "orpc")}}\nconst handler = new RPCHandler(appRouter);\n{{/if}}\n\n{{#if (eq runtime "node")}}\nconst app = new Elysia({ adapter: node() })\n{{else}}\nconst app = new Elysia()\n{{/if}}\n  .use(\n    cors({\n      origin: process.env.CORS_ORIGIN || "",\n      methods: ["GET", "POST", "OPTIONS"],\n      {{#if auth}}\n      allowedHeaders: ["Content-Type", "Authorization"],\n      credentials: true,\n      {{/if}}\n    }),\n  )\n  {{#if auth}}\n  .all("/api/auth/*", async (context) => {\n    const { request } = context;\n    if (["POST", "GET"].includes(request.method)) {\n      return auth.handler(request);\n    }\n    context.error(405);\n  })\n  {{/if}}\n{{#if (eq api "orpc")}}\n  .all('/rpc*', async (context) => {\n    const { response } = await handler.handle(context.request, {\n      prefix: '/rpc',\n      context: await createContext({ context })\n    })\n    return response ?? new Response('Not Found', { status: 404 })\n  })\n{{/if}}\n{{#if (eq api "trpc")}}\n  .all("/trpc/*", async (context) => {\n    const res = await fetchRequestHandler({\n      endpoint: "/trpc",\n      router: appRouter,\n      req: context.request,\n      createContext: () => createContext({ context }),\n    });\n    return res;\n  })\n{{/if}}\n  .get("/", () => "OK")\n  .listen(3000, () => {\n    console.log("Server is running on http://localhost:3000");\n  });\n`,
        type: "text",
      },
      "backend/server/express/src/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "7d15f582c5",
        },
        content: `import "dotenv/config";\n{{#if (eq api "trpc")}}\nimport { createExpressMiddleware } from "@trpc/server/adapters/express";\nimport { createContext } from "./lib/context";\nimport { appRouter } from "./routers/index";\n{{/if}}\n{{#if (eq api "orpc")}}\nimport { RPCHandler } from "@orpc/server/node";\nimport { appRouter } from "./routers";\n{{#if auth}}\nimport { createContext } from "./lib/context";\n{{/if}}\n{{/if}}\nimport cors from "cors";\nimport express from "express";\n{{#if (includes examples "ai")}}\nimport { streamText } from "ai";\nimport { google } from "@ai-sdk/google";\n{{/if}}\n{{#if auth}}\nimport { auth } from "./lib/auth";\nimport { toNodeHandler } from "better-auth/node";\n{{/if}}\n\nconst app = express();\n\napp.use(\n  cors({\n    origin: process.env.CORS_ORIGIN || "",\n    methods: ["GET", "POST", "OPTIONS"],\n    {{#if auth}}\n    allowedHeaders: ["Content-Type", "Authorization"],\n    credentials: true,\n    {{/if}}\n  })\n);\n\n{{#if auth}}\napp.all("/api/auth{/*path}", toNodeHandler(auth));\n{{/if}}\n\n{{#if (eq api "trpc")}}\napp.use(\n  "/trpc",\n  createExpressMiddleware({\n    router: appRouter,\n    createContext\n  })\n);\n{{/if}}\n\n{{#if (eq api "orpc")}}\nconst handler = new RPCHandler(appRouter);\napp.use('/rpc{*path}', async (req, res, next) => {\n  const { matched } = await handler.handle(req, res, {\n    prefix: '/rpc',\n    {{#if auth}}\n    context: await createContext({ req }),\n    {{else}}\n    context: {},\n    {{/if}}\n  });\n  if (matched) return;\n  next();\n});\n{{/if}}\n\napp.use(express.json())\n\n{{#if (includes examples "ai")}}\napp.post("/ai", async (req, res) => {\n  const { messages = [] } = req.body || {};\n  const result = streamText({\n    model: google("gemini-1.5-flash"),\n    messages,\n  });\n  result.pipeDataStreamToResponse(res);\n});\n{{/if}}\n\napp.get("/", (_req, res) => {\n  res.status(200).send("OK");\n});\n\nconst port = process.env.PORT || 3000;\napp.listen(port, () => {\n  console.log(\`Server is running on port \${port}\`);\n});\n`,
        type: "text",
      },
      "backend/server/fastify/src/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "202aee9233",
        },
        content: `import "dotenv/config";\nimport Fastify from "fastify";\nimport fastifyCors from "@fastify/cors";\n\n{{#if (eq api "trpc")}}\nimport { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";\nimport { createContext } from "./lib/context";\nimport { appRouter, type AppRouter } from "./routers/index";\n{{/if}}\n\n{{#if (eq api "orpc")}}\nimport { RPCHandler } from "@orpc/server/node";\nimport { CORSPlugin } from "@orpc/server/plugins";\nimport { appRouter } from "./routers/index";\nimport { createServer } from "node:http";\n{{#if auth}}\nimport { createContext } from "./lib/context";\n{{/if}}\n{{/if}}\n\n{{#if (includes examples "ai")}}\nimport type { FastifyRequest, FastifyReply } from "fastify";\nimport { streamText, type Message } from "ai";\nimport { google } from "@ai-sdk/google";\n{{/if}}\n\n{{#if auth}}\nimport { auth } from "./lib/auth";\n{{/if}}\n\nconst baseCorsConfig = {\n  origin: process.env.CORS_ORIGIN || "",\n  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],\n  allowedHeaders: [\n    "Content-Type",\n    "Authorization",\n    "X-Requested-With"\n  ],\n  credentials: true,\n  maxAge: 86400,\n};\n\n{{#if (eq api "orpc")}}\nconst handler = new RPCHandler(appRouter, {\n  plugins: [\n    new CORSPlugin({\n      origin: process.env.CORS_ORIGIN,\n      credentials: true,\n      allowHeaders: ["Content-Type", "Authorization"],\n    }),\n  ],\n});\n\nconst fastify = Fastify({\n  logger: true,\n  serverFactory: (fastifyHandler) => {\n    const server = createServer(async (req, res) => {\n      const { matched } = await handler.handle(req, res, {\n        context: await createContext(req.headers),\n        prefix: "/rpc",\n      });\n\n      if (matched) {\n        return;\n      }\n\n      fastifyHandler(req, res);\n    });\n\n    return server;\n  },\n});\n{{else}}\nconst fastify = Fastify({\n  logger: true,\n});\n{{/if}}\n\nfastify.register(fastifyCors, baseCorsConfig);\n\n{{#if auth}}\nfastify.route({\n  method: ["GET", "POST"],\n  url: "/api/auth/*",\n  async handler(request, reply) {\n    try {\n      const url = new URL(request.url, \`http://\${request.headers.host}\`);\n      const headers = new Headers();\n      Object.entries(request.headers).forEach(([key, value]) => {\n        if (value) headers.append(key, value.toString());\n      });\n      const req = new Request(url.toString(), {\n        method: request.method,\n        headers,\n        body: request.body ? JSON.stringify(request.body) : undefined,\n      });\n      const response = await auth.handler(req);\n      reply.status(response.status);\n      response.headers.forEach((value, key) => reply.header(key, value));\n      reply.send(response.body ? await response.text() : null);\n    } catch (error) {\n      fastify.log.error("Authentication Error:", error);\n      reply.status(500).send({\n        error: "Internal authentication error",\n        code: "AUTH_FAILURE"\n      });\n    }\n  }\n});\n{{/if}}\n\n{{#if (eq api "trpc")}}\nfastify.register(fastifyTRPCPlugin, {\n  prefix: "/trpc",\n  trpcOptions: {\n    router: appRouter,\n    createContext,\n    onError({ path, error }) {\n      console.error(\`Error in tRPC handler on path '\${path}':\`, error);\n    },\n  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],\n});\n{{/if}}\n\n{{#if (includes examples "ai")}}\ninterface AiRequestBody {\n  id?: string;\n  messages: Message[];\n}\n\nfastify.post('/ai', async function (request, reply) {\n  const { messages } = request.body as AiRequestBody;\n  const result = streamText({\n    model: google('gemini-1.5-flash'),\n    messages,\n  });\n\n  reply.header('X-Vercel-AI-Data-Stream', 'v1');\n  reply.header('Content-Type', 'text/plain; charset=utf-8');\n\n  return reply.send(result.toDataStream());\n});\n{{/if}}\n\nfastify.get('/', async () => {\n  return 'OK'\n})\n\nfastify.listen({ port: 3000 }, (err) => {\n  if (err) {\n    fastify.log.error(err);\n    process.exit(1);\n  }\n  console.log("Server running on port 3000");\n});\n`,
        type: "text",
      },
      "backend/server/hono/src/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "db661b84bf",
        },
        content: `{{#if (or (eq runtime "bun") (eq runtime "node"))}}\nimport "dotenv/config";\n{{/if}}\n{{#if (eq runtime "workers")}}\nimport { env } from "cloudflare:workers";\n{{/if}}\n{{#if (eq api "orpc")}}\nimport { RPCHandler } from "@orpc/server/fetch";\nimport { createContext } from "./lib/context";\nimport { appRouter } from "./routers/index";\n{{/if}}\n{{#if (eq api "trpc")}}\nimport { trpcServer } from "@hono/trpc-server";\nimport { createContext } from "./lib/context";\nimport { appRouter } from "./routers/index";\n{{/if}}\n{{#if auth}}\nimport { auth } from "./lib/auth";\n{{/if}}\nimport { Hono } from "hono";\nimport { cors } from "hono/cors";\nimport { logger } from "hono/logger";\n{{#if (and (includes examples "ai") (or (eq runtime "bun") (eq runtime "node")))}}\nimport { streamText } from "ai";\nimport { google } from "@ai-sdk/google";\nimport { stream } from "hono/streaming";\n{{/if}}\n{{#if (and (includes examples "ai") (eq runtime "workers"))}}\nimport { streamText } from "ai";\nimport { stream } from "hono/streaming";\nimport { createGoogleGenerativeAI } from "@ai-sdk/google";\n{{/if}}\n\nconst app = new Hono();\n\napp.use(logger());\napp.use("/*", cors({\n  {{#if (or (eq runtime "bun") (eq runtime "node"))}}\n  origin: process.env.CORS_ORIGIN || "",\n  {{/if}}\n  {{#if (eq runtime "workers")}}\n  origin: env.CORS_ORIGIN || "",\n  {{/if}}\n  allowMethods: ["GET", "POST", "OPTIONS"],\n  {{#if auth}}\n  allowHeaders: ["Content-Type", "Authorization"],\n  credentials: true,\n  {{/if}}\n}));\n\n{{#if auth}}\napp.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));\n{{/if}}\n\n{{#if (eq api "orpc")}}\nconst handler = new RPCHandler(appRouter);\napp.use("/rpc/*", async (c, next) => {\n  const context = await createContext({ context: c });\n  const { matched, response } = await handler.handle(c.req.raw, {\n    prefix: "/rpc",\n    context: context,\n  });\n\n  if (matched) {\n    return c.newResponse(response.body, response);\n  }\n  await next();\n});\n{{/if}}\n\n{{#if (eq api "trpc")}}\napp.use("/trpc/*", trpcServer({\n  router: appRouter,\n  createContext: (_opts, context) => {\n    return createContext({ context });\n  },\n}));\n{{/if}}\n\n{{#if (and (includes examples "ai") (or (eq runtime "bun") (eq runtime "node")))}}\napp.post("/ai", async (c) => {\n  const body = await c.req.json();\n  const messages = body.messages || [];\n  const result = streamText({\n    model: google("gemini-1.5-flash"),\n    messages,\n  });\n\n  c.header("X-Vercel-AI-Data-Stream", "v1");\n  c.header("Content-Type", "text/plain; charset=utf-8");\n  return stream(c, (stream) => stream.pipe(result.toDataStream()));\n});\n{{/if}}\n\n{{#if (and (includes examples "ai") (eq runtime "workers"))}}\napp.post("/ai", async (c) => {\n  const body = await c.req.json();\n  const messages = body.messages || [];\n  const google = createGoogleGenerativeAI({\n    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,\n  });\n  const result = streamText({\n    model: google("gemini-1.5-flash"),\n    messages,\n  });\n\n  c.header("X-Vercel-AI-Data-Stream", "v1");\n  c.header("Content-Type", "text/plain; charset=utf-8");\n  return stream(c, (stream) => stream.pipe(result.toDataStream()));\n});\n{{/if}}\n\napp.get("/", (c) => {\n  return c.text("OK");\n});\n\n{{#if (eq runtime "node")}}\nimport { serve } from "@hono/node-server";\n\nserve({\n  fetch: app.fetch,\n  port: 3000,\n}, (info) => {\n  console.log(\`Server is running on http://localhost:\${info.port}\`);\n});\n{{else}}\n  {{#if (eq runtime "bun")}}\nexport default app;\n  {{/if}}\n  {{#if (eq runtime "workers")}}\nexport default app;\n  {{/if}}\n{{/if}}\n`,
        type: "text",
      },
      "backend/server/next/next-env.d.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "f75a118439",
        },
        content: `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n`,
        type: "text",
      },
      "backend/server/next/next.config.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "89327ac52f",
        },
        content: `import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  /* config options here */\n};\n\nexport default nextConfig;\n`,
        type: "text",
      },
      "backend/server/next/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "0b109deaf9",
        },
        content: `{\n  "name": "server",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev --turbopack",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "15.3.0",\n    "dotenv": "^16.5.0"\n  },\n{{#if (eq dbSetup 'supabase')}}\n  "trustedDependencies": [\n    "supabase"\n   ],\n{{/if}}\n  "devDependencies": {\n    "@types/node": "^20",\n    "@types/react": "^19",\n    "typescript": "^5"\n  }\n}\n`,
        type: "text",
      },
      "backend/server/next/src/app/route.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e40f5d7501",
        },
        content: `import { NextResponse } from "next/server";\n\nexport async function GET() {\n  return NextResponse.json({ message: "OK" });\n}\n`,
        type: "text",
      },
      "backend/server/next/src/middleware.ts": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "d71ca4997c",
        },
        content: `import { NextResponse } from "next/server";\n\nexport function middleware() {\n  const res = NextResponse.next()\n\n  res.headers.append('Access-Control-Allow-Credentials', "true")\n  res.headers.append('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || "")\n  res.headers.append('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')\n  res.headers.append(\n    'Access-Control-Allow-Headers',\n    'Content-Type, Authorization'\n  )\n\n  return res\n}\n\nexport const config = {\n  matcher: '/:path*',\n}\n`,
        type: "text",
      },
      "backend/server/next/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e47257abfb",
        },
        content: `{\n  "compilerOptions": {\n    "target": "ES2017",\n    "lib": ["dom", "dom.iterable", "esnext"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "bundler",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    {{#unless (or (eq backend "convex") (eq backend "none"))}}\n	  "composite": true,\n	{{/unless}}\n    "incremental": true,\n    "plugins": [\n      {\n        "name": "next"\n      }\n    ],\n	"paths": {\n		"@/*": ["./src/*"]\n		{{#if (eq orm 'prisma')}},\n		"prisma": ["node_modules/prisma"]\n		{{/if}}\n	},\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}\n`,
        type: "text",
      },
      "backend/server/server-base/package.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "1cd020a140",
        },
        content: `{\n	"name": "server",\n	"main": "src/index.ts",\n	"type": "module",\n	"scripts": {\n		"build": "tsc && tsc-alias",\n		"check-types": "tsc --noEmit",\n		"compile": "bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile server"\n	},\n	{{#if (eq orm 'prisma')}}\n    "prisma": {\n        "schema": "./schema"\n    },\n    {{/if}}\n	"dependencies": {\n		"dotenv": "^16.4.7",\n		"zod": "^3.25.16"\n	},\n	{{#if (eq dbSetup 'supabase')}}\n	"trustedDependencies": [\n        "supabase"\n    ],\n    {{/if}}\n	"devDependencies": {\n		"tsc-alias": "^1.8.11",\n		"typescript": "^5.8.2"\n	}\n}\n`,
        type: "text",
      },
      "backend/server/server-base/src/routers/index.ts.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "2a92c7eab7",
        },
        content: `{{#if (eq api "orpc")}}\nimport { {{#if auth}}protectedProcedure, {{/if}}publicProcedure } from "../lib/orpc";\n{{#if (includes examples "todo")}}\nimport { todoRouter } from "./todo";\n{{/if}}\n\nexport const appRouter = {\n  healthCheck: publicProcedure.handler(() => {\n    return "OK";\n  }),\n  {{#if auth}}\n  privateData: protectedProcedure.handler(({ context }) => {\n    return {\n      message: "This is private",\n      user: context.session?.user,\n    };\n  }),\n  {{/if}}\n  {{#if (includes examples "todo")}}\n  todo: todoRouter,\n  {{/if}}\n};\nexport type AppRouter = typeof appRouter;\n{{else if (eq api "trpc")}}\nimport {\n  {{#if auth}}protectedProcedure, {{/if}}publicProcedure,\n  router,\n} from "../lib/trpc";\n{{#if (includes examples "todo")}}\nimport { todoRouter } from "./todo";\n{{/if}}\n\nexport const appRouter = router({\n  healthCheck: publicProcedure.query(() => {\n    return "OK";\n  }),\n  {{#if auth}}\n  privateData: protectedProcedure.query(({ ctx }) => {\n    return {\n      message: "This is private",\n      user: ctx.session.user,\n    };\n  }),\n  {{/if}}\n  {{#if (includes examples "todo")}}\n  todo: todoRouter,\n  {{/if}}\n});\nexport type AppRouter = typeof appRouter;\n{{else}}\nexport const appRouter = {};\nexport type AppRouter = typeof appRouter;\n{{/if}}\n`,
        type: "text",
      },
      "backend/server/server-base/tsconfig.json.hbs": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "e8e301561a",
        },
        content: `{\n  "compilerOptions": {\n    "target": "ESNext",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "verbatimModuleSyntax": true,\n    "strict": true,\n    "skipLibCheck": true,\n    "baseUrl": "./",\n    "paths": {\n      "@/*": ["./src/*"]\n      {{#if (eq orm "prisma")}},\n      "prisma": ["node_modules/prisma"]\n      {{/if}}\n    },\n    "outDir": "./dist",\n    "types": [\n      {{#if (eq runtime "node")}}\n      "node"\n      {{else if (eq runtime "bun")}}\n      "bun"\n      {{else if (eq runtime "workers")}}\n      "./worker-configuration",\n      "node"\n      {{else}}\n      "node",\n      "bun"\n      {{/if}}\n    ],\n    {{#unless (or (eq backend "convex") (eq backend "none"))}}\n    "composite": true,\n    {{/unless}}\n    "jsx": "react-jsx"{{#if (eq backend "hono")}},\n    "jsxImportSource": "hono/jsx"{{/if}}\n  },\n  "tsc-alias": {\n    "resolveFullPaths": true\n  }\n}\n`,
        type: "text",
      },
      "backend/server/server-base/_gitignore": {
        metadata: {
          updatedAt: "2025-06-17T06:06:35.000Z",
          updatedHash: "22473bb619",
        },
        content: `# prod\ndist/\n/build\n/out/\n\n# dev\n.yarn/\n!.yarn/patches\n!.yarn/plugins\n!.yarn/releases\n!.yarn/versions\n.vscode/*\n!.vscode/launch.json\n!.vscode/*.code-snippets\n.idea/workspace.xml\n.idea/usage.statistics.xml\n.idea/shelf\n.wrangler\n/.next/\n.vercel\n\n# deps\nnode_modules/\n/node_modules\n/.pnp\n.pnp.*\n\n# env\n.env*\n.env.production\n!.env.example\n.dev.vars\n\n# logs\nlogs/\n*.log\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npnpm-debug.log*\nlerna-debug.log*\n\n# misc\n.DS_Store\n*.pem\n\n# local db\n*.db*\n\n# typescript\n*.tsbuildinfo\nnext-env.d.ts\n`,
        type: "text",
      },
    },
  },
};
