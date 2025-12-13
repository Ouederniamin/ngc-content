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

    const { exerciseId, codeType } = await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Missing exercise ID" },
        { status: 400 }
      );
    }

    // Fetch exercise with all instructions
    const exercise = await prisma.lessonExercise.findFirst({
      where: {
        id: exerciseId,
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
          include: {
            answers: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found or unauthorized" },
        { status: 404 }
      );
    }

    if (exercise.instructions.length === 0) {
      return NextResponse.json(
        { error: "No instructions found in this exercise" },
        { status: 400 }
      );
    }

    const effectiveCodeType = codeType || exercise.codeType || "javascript";

    // Build context for AI - generate all answers in one call for consistency
    const context = `
SKILL PATH: ${exercise.lesson.module.unit.skillPath.title}
LESSON: ${exercise.lesson.title}
EXERCISE: ${exercise.title}
${exercise.description ? `EXERCISE DESCRIPTION: ${exercise.description}` : ""}
${exercise.content ? `EXERCISE STARTER CODE:\n${exercise.content}` : ""}

INSTRUCTIONS:
${exercise.instructions.map((inst, i) => `
INSTRUCTION ${i + 1}:
Title: ${inst.title}
${inst.body ? `Details: ${inst.body}` : ""}
`).join("\n")}
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

    const prompt = `You are an expert coding instructor creating expected answers for a coding exercise.

CODE TYPE: ${codeTypeMap[effectiveCodeType] || effectiveCodeType}

${context}

Generate the EXPECTED ANSWER (correct code solution) for EACH instruction step.

IMPORTANT: Return your response as a JSON array with exactly ${exercise.instructions.length} objects, one for each instruction IN ORDER.

Each object should have:
- "step": the instruction number (1, 2, 3, etc.)
- "code": the expected code answer for that step

The code for each step should:
1. Show the cumulative solution up to that step
2. Be clean, well-formatted, and follow best practices
3. Include helpful inline comments
4. Build upon previous steps naturally

Example format:
[
  {"step": 1, "code": "// Step 1 solution code here"},
  {"step": 2, "code": "// Step 2 cumulative solution here"},
  {"step": 3, "code": "// Step 3 cumulative solution here"}
]

Return ONLY the JSON array, no other text.`;

    console.log("Generating answers for all instructions in exercise:", exercise.title);

    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini");

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 4000,
    });

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "AI generated empty content. Please try again." },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let answers;
    try {
      // Clean up potential markdown fences
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
      }
      answers = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Invalid AI response format. Please try again." },
        { status: 500 }
      );
    }

    // Save answers to database
    const savedAnswers = [];
    for (let i = 0; i < exercise.instructions.length; i++) {
      const instruction = exercise.instructions[i];
      const answerData = answers.find((a: { step: number }) => a.step === i + 1) || answers[i];
      
      if (!answerData || !answerData.code) {
        console.warn(`No answer found for instruction ${i + 1}`);
        continue;
      }

      // Determine which field to populate based on code type
      const dbAnswerData: {
        htmlAnswer?: string;
        cssAnswer?: string;
        jsAnswer?: string;
        pythonAnswer?: string;
      } = {};

      switch (effectiveCodeType) {
        case "html":
          dbAnswerData.htmlAnswer = answerData.code;
          break;
        case "css":
          dbAnswerData.cssAnswer = answerData.code;
          break;
        case "python":
          dbAnswerData.pythonAnswer = answerData.code;
          break;
        default:
          dbAnswerData.jsAnswer = answerData.code;
      }

      // Create or update the answer
      let savedAnswer;
      if (instruction.answers.length > 0) {
        savedAnswer = await prisma.instructionAnswer.update({
          where: { id: instruction.answers[0].id },
          data: dbAnswerData,
        });
      } else {
        savedAnswer = await prisma.instructionAnswer.create({
          data: {
            ...dbAnswerData,
            instructionId: instruction.id,
          },
        });
      }
      savedAnswers.push({
        instructionId: instruction.id,
        answerId: savedAnswer.id,
        step: i + 1,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${savedAnswers.length} answers`,
      answers: savedAnswers,
    });
  } catch (error) {
    console.error("Error generating instruction answers:", error);
    return NextResponse.json(
      { error: "Failed to generate instruction answers" },
      { status: 500 }
    );
  }
}
