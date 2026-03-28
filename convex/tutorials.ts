"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const getTutorials = action({
  args: { query: v.string() },
  handler: async (_ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_API_KEY is not configured for this Convex deployment.");
    }

    const searchQuery = `${args.query.trim()} painting tutorial`.trim();

    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query: searchQuery,
        numResults: 3,
        type: "auto",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Exa request failed: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as {
      results?: Array<{ title?: string; url?: string }>;
    };

    const results = data.results ?? [];
    return results.slice(0, 3).map((r) => ({
      title: r.title ?? "Untitled",
      url: r.url ?? "",
    }));
  },
});
