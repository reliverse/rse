import { v } from "convex/values";

// @ts-expect-error dler-remove-comment
import { query, mutation } from "./_generated/server";

export const getAll = query({
  // @ts-expect-error dler-remove-comment
  handler: async (ctx) => {
    return await ctx.db.query("todos").collect();
  },
});

export const create = mutation({
  args: {
    text: v.string(),
  },
  // @ts-expect-error dler-remove-comment
  handler: async (ctx, args) => {
    const newTodoId = await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
    });
    return await ctx.db.get(newTodoId);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("todos"),
    completed: v.boolean(),
  },
  // @ts-expect-error dler-remove-comment
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { completed: args.completed });
    return { success: true };
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  // @ts-expect-error dler-remove-comment
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
