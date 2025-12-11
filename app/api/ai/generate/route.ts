import { streamText } from "ai";
import { model, SYSTEM_PROMPTS } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { type, prompt, language } = await request.json();

  const systemPrompt =
    type === "translate"
      ? SYSTEM_PROMPTS.translate
      : SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS] ||
        SYSTEM_PROMPTS.lesson;

  const fullPrompt =
    type === "translate"
      ? `Translate the following content to ${language === "fr" ? "French" : "Tunisian Arabic"}:\n\n${prompt}`
      : prompt;

  const result = streamText({
    model,
    system: systemPrompt,
    prompt: fullPrompt,
    maxOutputTokens: 4000,
  });

  return result.toTextStreamResponse();
}
