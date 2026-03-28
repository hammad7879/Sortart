"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  chatCompletionModel,
  formatLlmHttpError,
  getLlmConfig,
  missingLlmKeyMessage,
} from "./llm.shared";

const COACH_SYSTEM = `You are ArtWise, a warm, expert AI art coach for painters.
Help with color theory, composition, brushwork, mixing, mood, and constructive feedback.
Keep replies clear and practical. If the user includes an artwork image, refer to what you see when it helps.`;

const MAX_IMAGE_DATA_URL_CHARS = 6_000_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail: "low" | "high" } };

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
};

function buildOpenAIMessages(
  history: ChatMessage[],
  lastUserIndex: number | undefined,
  attachImage: boolean,
  imageUrl: string | undefined,
): OpenAIMessage[] {
  const openAIMessages: OpenAIMessage[] = [
    { role: "system", content: COACH_SYSTEM },
  ];

  for (let i = 0; i < history.length; i++) {
    const m = history[i];
    if (m.role === "assistant") {
      openAIMessages.push({ role: "assistant", content: m.content });
      continue;
    }
    if (
      attachImage &&
      i === lastUserIndex &&
      imageUrl &&
      typeof lastUserIndex === "number"
    ) {
      openAIMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: m.content || "What do you think of my painting?",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "low" },
          },
        ],
      });
    } else {
      openAIMessages.push({ role: "user", content: m.content });
    }
  }

  return openAIMessages;
}

async function postChatCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: OpenAIMessage[],
): Promise<Response> {
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
    }),
  });
}

export const sendCoachMessage = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      }),
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const llm = getLlmConfig();
    if (!llm) {
      throw new Error(missingLlmKeyMessage());
    }

    const history: ChatMessage[] = args.messages.slice(-24);

    const lastUserIndex = [...history]
      .map((m, i) => (m.role === "user" ? i : -1))
      .filter((i) => i >= 0)
      .pop();

    const useImage =
      typeof lastUserIndex === "number" &&
      typeof args.imageUrl === "string" &&
      args.imageUrl.startsWith("data:image/") &&
      args.imageUrl.length <= MAX_IMAGE_DATA_URL_CHARS;

    let attachImage = useImage;
    let model = chatCompletionModel(llm.kind, attachImage);
    let openAIMessages = buildOpenAIMessages(
      history,
      lastUserIndex,
      attachImage,
      args.imageUrl,
    );

    let res = await postChatCompletion(
      llm.baseUrl,
      llm.apiKey,
      model,
      openAIMessages,
    );

    if (
      !res.ok &&
      llm.kind === "groq" &&
      useImage &&
      (res.status === 400 || res.status === 413 || res.status === 422)
    ) {
      const _err = await res.text();
      attachImage = false;
      model = chatCompletionModel(llm.kind, false);
      openAIMessages = buildOpenAIMessages(
        history,
        lastUserIndex,
        false,
        args.imageUrl,
      );
      res = await postChatCompletion(
        llm.baseUrl,
        llm.apiKey,
        model,
        openAIMessages,
      );
    }

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
