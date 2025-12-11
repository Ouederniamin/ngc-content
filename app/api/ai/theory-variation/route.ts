import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_ENDPOINT?.replace("https://", "").replace(".openai.azure.com", "") || "",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
  useDeploymentBasedUrls: true,
});

const STYLE_PROMPTS: Record<string, string> = {
  standard: `Write a clear, balanced theory explanation that is suitable for general learners. 
Use straightforward language, provide context, and include relevant examples. 
Structure the content with clear headings and paragraphs.`,

  simplified: `Write a beginner-friendly theory explanation using simple language and relatable analogies. 
Avoid jargon, break down complex concepts into smaller pieces, and use everyday examples.
Assume the reader has no prior knowledge of programming.`,

  technical: `Write an in-depth technical explanation for advanced learners.
Include detailed information about how things work under the hood, performance considerations,
best practices, and edge cases. Use proper technical terminology.`,

  storytelling: `Write the theory as an engaging story or narrative.
Use real-world scenarios, character examples, or a journey metaphor to explain the concepts.
Make it memorable and relatable while ensuring the technical accuracy.`,

  visual: `Write theory content that emphasizes visual learning.
Include plenty of code examples with detailed comments, describe visual diagrams,
use bullet points and numbered lists, and format code snippets clearly.
Describe step-by-step what happens visually when code runs.`,
};

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, lessonId, style, title } = await request.json();

    if (!exerciseId || !lessonId || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the exercise belongs to the user
    const exercise = await prisma.lessonExercise.findFirst({
      where: {
        id: exerciseId,
        lessonId: lessonId,
        lesson: {
          module: {
            unit: {
              skillPath: {
                creatorId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                unit: {
                  include: {
                    skillPath: true,
                  },
                },
              },
            },
          },
        },
        instructions: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build context for AI
    const lessonContext = `
SkillPath: ${exercise.lesson.module.unit.skillPath.title}
Unit: ${exercise.lesson.module.unit.title}
Module: ${exercise.lesson.module.title}
Lesson: ${exercise.lesson.title}
Exercise: ${exercise.title}
Code Type: ${exercise.codeType}

Instructions in this exercise:
${exercise.instructions.map((inst, i) => `${i + 1}. ${inst.title}`).join("\n")}
`;

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.standard;

    const prompt = `You are an expert educational content creator for a coding education platform called NextGen Coding.

${stylePrompt}

Create theory content for the following exercise:

${lessonContext}

Requirements:
1. Write comprehensive theory content that prepares students for the exercise
2. Explain the concepts they need to understand before attempting the exercise
3. Use HTML formatting for the content (headings, paragraphs, code blocks, lists)
4. Make sure the content is directly relevant to what the exercise teaches
5. Include at least one code example if applicable
6. The content should be between 500-1000 words

Return ONLY the HTML content, no markdown, no code blocks wrapping.`;

    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini");

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 2000,
    });

    // Get the current count of variations for positioning
    const existingCount = await prisma.theoryVariation.count({
      where: { exerciseId },
    });

    // Save the generated variation
    const variation = await prisma.theoryVariation.create({
      data: {
        title: title || STYLE_PROMPTS[style] ? style.charAt(0).toUpperCase() + style.slice(1) : "Variation",
        content: text,
        style: style,
        isActive: existingCount === 0, // First variation is active by default
        position: existingCount + 1,
        exerciseId: exerciseId,
      },
    });

    return NextResponse.json({
      success: true,
      variation: {
        id: variation.id,
        title: variation.title,
        style: variation.style,
      },
    });
  } catch (error) {
    console.error("Error generating theory variation:", error);
    return NextResponse.json(
      { error: "Failed to generate theory variation" },
      { status: 500 }
    );
  }
}
