import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createArtwork = mutation({
  args: {
    title: v.string(),
    referenceImage: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("artworks", {
      title: args.title,
      referenceImage: args.referenceImage,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getArtworks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("artworks")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});
