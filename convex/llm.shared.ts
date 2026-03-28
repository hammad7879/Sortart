/** Shared LLM helpers. File name uses multiple dots so Convex does not expose it as api.* */

export type LlmKind = "groq" | "openai";

export type LlmConfig = {
  kind: LlmKind;
  baseUrl: string;
  apiKey: string;
};

export const CONVEX_LLM_ENV_HINT =
  "Convex does not read Next.js .env.local for backend actions. Add the key in Convex: Dashboard → your deployment → Settings → Environment variables, or run: npx convex env set GROQ_API_KEY \"your-key\"";

function isGroqKey(key: string): boolean {
  return key.startsWith("gsk_");
}

/**
 * Resolves which LLM to call. Groq keys always start with `gsk_` — if that key was
 * saved under OPENAI_API_KEY in Convex by mistake, we still route to Groq.
 */
export function getLlmConfig(): LlmConfig | null {
  const groqExplicit = process.env.GROQ_API_KEY?.trim();
  const openaiSlot = process.env.OPENAI_API_KEY?.trim();

  const groqKey =
    groqExplicit ||
    (openaiSlot && isGroqKey(openaiSlot) ? openaiSlot : undefined);

  if (groqKey) {
    return {
      kind: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: groqKey,
    };
  }

  if (openaiSlot && !isGroqKey(openaiSlot)) {
    return {
      kind: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: openaiSlot,
    };
  }

  return null;
}

export function missingLlmKeyMessage(): string {
  return `No LLM key on this Convex deployment. Add GROQ_API_KEY (Groq keys start with gsk_) or a real OpenAI key as OPENAI_API_KEY. ${CONVEX_LLM_ENV_HINT}`;
}

/** Groq: vision uses Llama 4 Scout; text uses Llama 3.3 70B. OpenAI: gpt-4o-mini. */
export function chatCompletionModel(kind: LlmKind, vision: boolean): string {
  if (kind === "groq") {
    return vision
      ? "meta-llama/llama-4-scout-17b-16e-instruct"
      : "llama-3.3-70b-versatile";
  }
  return "gpt-4o-mini";
}

export function formatLlmHttpError(
  status: number,
  bodyText: string,
  provider: LlmKind,
): string {
  let parsed: { error?: { code?: string; message?: string; type?: string } } | null =
    null;
  try {
    parsed = JSON.parse(bodyText) as {
      error?: { code?: string; message?: string; type?: string };
    };
  } catch {
    /* raw text */
  }

  const code = parsed?.error?.code;
  const message = parsed?.error?.message ?? "";
  const type = parsed?.error?.type ?? "";

  if (status === 401) {
    if (provider === "groq") {
      return `Groq rejected this API key (check it in Convex → Environment). ${CONVEX_LLM_ENV_HINT}`;
    }
    return `OpenAI rejected this API key (invalid, revoked, or out of quota). If you use Groq, put the gsk_ key in GROQ_API_KEY—or only OPENAI_API_KEY is fine; keys starting with gsk_ are sent to Groq automatically. ${CONVEX_LLM_ENV_HINT}`;
  }

  if (status === 429) {
    if (provider === "openai") {
      if (
        code === "insufficient_quota" ||
        type === "insufficient_quota" ||
        /quota|billing/i.test(message)
      ) {
        return "OpenAI quota or billing issue on this key. Prefer Groq: set GROQ_API_KEY in Convex (Groq is used first when set) and remove or fix OPENAI_API_KEY.";
      }
    }
    if (provider === "groq") {
      return "Groq rate limit: wait briefly and retry, or check your Groq plan limits.";
    }
    return "Rate limit: wait a short time and try again.";
  }

  if (message) {
    const short =
      message.length > 220 ? `${message.slice(0, 217)}…` : message;
    return `${provider === "groq" ? "Groq" : "LLM"}: ${short}`;
  }

  return `LLM request failed (HTTP ${status}).`;
}
