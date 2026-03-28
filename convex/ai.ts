"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  chatCompletionModel,
  formatLlmHttpError,
  getLlmConfig,
  missingLlmKeyMessage,
} from "./llm.shared";

const SYSTEM_PROMPT =
  "You are an expert painting assistant. Explain how to mix colors using red, blue, yellow, white, and black paints.";

export const getColorMix = action({
  args: { hex: v.string() },
  handler: async (_ctx, args) => {
    const llm = getLlmConfig();
    if (!llm) {
      throw new Error(missingLlmKeyMessage());
    }

    const model = chatCompletionModel(llm.kind, false);

    const res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llm.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `How do I mix this color: ${args.hex}? Give simple ratios.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(formatLlmHttpError(res.status, errText, llm.kind));
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("The model returned an empty response. Try again.");
    }
    return text;
  },
});
