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

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instructionId, codeType } = await request.json();

    if (!instructionId) {
      return NextResponse.json(
        { error: "Missing instruction ID" },
        { status: 400 }
      );
    }

    // Fetch instruction with full context
    const instruction = await prisma.lessonInstruction.findFirst({
      where: {
        id: instructionId,
        exercise: {
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
      },
      include: {
        exercise: {
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
        },
        answers: true,
      },
    });

    if (!instruction) {
      return NextResponse.json(
        { error: "Instruction not found or unauthorized" },
        { status: 404 }
      );
    }

    const exercise = instruction.exercise;
    const effectiveCodeType = codeType || exercise.codeType || "javascript";

    // Build context for AI
    const context = `
SKILL PATH: ${exercise.lesson.module.unit.skillPath.title}
LESSON: ${exercise.lesson.title}
EXERCISE: ${exercise.title}
${exercise.description ? `EXERCISE DESCRIPTION: ${exercise.description}` : ""}
${exercise.content ? `EXERCISE STARTER CODE:\n${exercise.content}` : ""}

ALL INSTRUCTIONS IN THIS EXERCISE:
${exercise.instructions.map((inst, i) => `${i + 1}. ${inst.title}${inst.body ? `\n   ${inst.body}` : ""}`).join("\n")}

CURRENT INSTRUCTION TO GENERATE ANSWER FOR:
Title: ${instruction.title}
${instruction.body ? `Details: ${instruction.body}` : ""}
Position: Step ${instruction.position} of ${exercise.instructions.length}
`;

    const codeTypeMap: Record<string, string> = {
      html: "HTML",
      css: "CSS",
      javascript: "JavaScript (ES6+)",
      typescript: "TypeScript",
      python: "Python 3",
      react: "React/JSX",
      nextjs: "Next.js",
      nodejs: "Node.js",
    };

    const prompt = `You are an expert coding instructor creating expected answers for a coding exercise instruction.

CODE TYPE: ${codeTypeMap[effectiveCodeType] || effectiveCodeType}

${context}

Generate the EXPECTED ANSWER (the correct code solution) for this specific instruction step.

Requirements:
1. The answer should be the exact code that correctly completes this instruction step
2. The code should be clean, well-formatted, and follow best practices
3. Include only the code that directly relates to this instruction step
4. If this step builds on previous steps, show the cumulative result
5. Add brief inline comments if helpful for understanding

Return ONLY the code, no markdown fences, no explanations.`;

    console.log("Generating answer for instruction:", instruction.title);

    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini");

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 1500,
    });

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "AI generated empty content. Please try again." },
        { status: 500 }
      );
    }

    // Clean up any markdown code fences
    let cleanedContent = text.trim();
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }

    // Determine which field to populate based on code type
    const answerData: {
      htmlAnswer?: string;
      cssAnswer?: string;
      jsAnswer?: string;
      pythonAnswer?: string;
    } = {};

    switch (effectiveCodeType) {
      case "html":
        answerData.htmlAnswer = cleanedContent;
        break;
      case "css":
        answerData.cssAnswer = cleanedContent;
        break;
      case "python":
        answerData.pythonAnswer = cleanedContent;
        break;
      default:
        // JavaScript, TypeScript, React, Next.js, Node.js all go to jsAnswer
        answerData.jsAnswer = cleanedContent;
    }

    // Create or update the answer
    let answer;
    if (instruction.answers.length > 0) {
      // Update existing answer
      answer = await prisma.instructionAnswer.update({
        where: { id: instruction.answers[0].id },
        data: answerData,
      });
    } else {
      // Create new answer
      answer = await prisma.instructionAnswer.create({
        data: {
          ...answerData,
          instructionId: instruction.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      answer: {
        id: answer.id,
        content: cleanedContent,
        codeType: effectiveCodeType,
      },
    });
  } catch (error) {
    console.error("Error generating instruction answer:", error);
    return NextResponse.json(
      { error: "Failed to generate instruction answer" },
      { status: 500 }
    );
  }
}
