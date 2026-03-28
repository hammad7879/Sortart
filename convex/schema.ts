import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  artworks: defineTable({
    title: v.string(),
    referenceImage: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
