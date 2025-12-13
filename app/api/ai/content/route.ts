import { generateObject } from "ai";
import { model, SYSTEM_PROMPTS } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/db";

// Zod schemas for content generation
const LessonInstructionSchema = z.object({
  title: z.string(),
  body: z.string(),
  htmlAnswer: z.string().optional(),
  cssAnswer: z.string().optional(),
  jsAnswer: z.string().optional(),
  pythonAnswer: z.string().optional(),
});

const LessonExerciseSchema = z.object({
  title: z.string(),
  codeType: z.enum([
    "html",
    "css",
    "html-css",
    "html-js",
    "html-css-js",
    "javascript",
    "python",
  ]),
  initialHTMLCode: z.string().optional(),
  initialCSSCode: z.string().optional(),
  initialJSCode: z.string().optional(),
  initialPythonCode: z.string().optional(),
  instructions: z.array(LessonInstructionSchema),
});

const LessonSchema = z.object({
  title: z.string(),
  description: z.string().describe("Brief description of what the lesson covers"),
  exercises: z.array(LessonExerciseSchema),
});

const QuizAnswerSchema = z.object({
  answer: z.string(),
  isCorrect: z.boolean(),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  explanation: z.string(),
  answers: z.array(QuizAnswerSchema).length(4),
});

const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(QuizQuestionSchema),
});

const TaskInstructionSchema = z.object({
  title: z.string(),
  body: z.string(),
  htmlAnswer: z.string().optional(),
  cssAnswer: z.string().optional(),
  jsAnswer: z.string().optional(),
  pythonAnswer: z.string().optional(),
});

const ProjectTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  taskType: z.enum(["CODE", "IMAGE"]).default("CODE"),
  codeType: z
    .enum([
      "html",
      "css",
      "html-css",
      "html-js",
      "html-css-js",
      "javascript",
      "python",
    ])
    .optional(),
  initialHTMLCode: z.string().optional(),
  initialCSSCode: z.string().optional(),
  initialJSCode: z.string().optional(),
  initialPythonCode: z.string().optional(),
  instructions: z.array(TaskInstructionSchema),
});

const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  notionContent: z.string().describe("HTML content for the project brief"),
  tasks: z.array(ProjectTaskSchema),
});

const ModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const UnitSchema = z.object({
  title: z.string(),
  description: z.string(),
  modules: z.array(ModuleSchema),
});

const SkillPathSchema = z.object({
  title: z.string(),
  description: z.string(),
  units: z.array(UnitSchema),
});

export async function POST(request: Request) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { type, prompt, moduleId, unitId, skillPathId } = await request.json();

  try {
    let schema: z.ZodType;
    let systemPrompt: string;

    switch (type) {
      case "skillpath":
        schema = SkillPathSchema;
        systemPrompt = SYSTEM_PROMPTS.skillPath;
        break;
      case "lesson":
        schema = LessonSchema;
        systemPrompt = SYSTEM_PROMPTS.lesson;
        break;
      case "quiz":
        schema = QuizSchema;
        systemPrompt = SYSTEM_PROMPTS.quiz;
        break;
      case "project":
        schema = ProjectSchema;
        systemPrompt = SYSTEM_PROMPTS.project;
        break;
      default:
        return new Response("Invalid content type", { status: 400 });
    }

    const result = await generateObject({
      model,
      system: systemPrompt,
      prompt,
      schema,
    });

    console.log("AI Generation successful, saving to database...");
    console.log("Content type:", type);
    console.log("User ID:", session.user.id);

    // Save to database based on type
    let savedContent;

    if (type === "skillpath") {
      const data = result.object as z.infer<typeof SkillPathSchema>;
      console.log("SkillPath data:", JSON.stringify(data, null, 2));
      
      try {
        savedContent = await prisma.skillPath.create({
          data: {
            title: data.title,
            description: data.description,
            creatorId: session.user.id,
            units: {
              create: data.units.map((unit, unitIndex) => ({
                title: unit.title,
                description: unit.description,
                position: unitIndex + 1,
                creatorId: session.user.id,
                modules: {
                  create: unit.modules.map((module, modIndex) => ({
                    title: module.title,
                    description: module.description,
                    position: modIndex + 1,
                    creatorId: session.user.id,
                  })),
              },
            })),
          },
        },
        include: {
          units: {
            include: {
              modules: true,
            },
          },
        },
      });
      console.log("SkillPath saved:", savedContent?.id);
      } catch (dbError) {
        console.error("Database save error:", dbError);
        throw dbError;
      }
    } else if (type === "lesson" && moduleId) {
      const data = result.object as z.infer<typeof LessonSchema>;
      const existingLessons = await prisma.lesson.count({
        where: { moduleId: parseInt(moduleId) },
      });

      savedContent = await prisma.lesson.create({
        data: {
          title: data.title,
          description: data.description,
          moduleId: parseInt(moduleId),
          position: existingLessons + 1,
          creatorId: session.user.id,
          exercises: {
            create: data.exercises.map((exercise, exIndex) => ({
              title: exercise.title,
              codeType: exercise.codeType,
              position: exIndex + 1,
              initialHTMLCode: exercise.initialHTMLCode,
              initialCSSCode: exercise.initialCSSCode,
              initialJSCode: exercise.initialJSCode,
              initialPythonCode: exercise.initialPythonCode,
              instructions: {
                create: exercise.instructions.map((instruction, insIndex) => ({
                  title: instruction.title,
                  body: instruction.body,
                  position: insIndex + 1,
                  answers: {
                    create: {
                      htmlAnswer: instruction.htmlAnswer,
                      cssAnswer: instruction.cssAnswer,
                      jsAnswer: instruction.jsAnswer,
                      pythonAnswer: instruction.pythonAnswer,
                    },
                  },
                })),
              },
            })),
          },
        },
        include: {
          exercises: {
            include: {
              instructions: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });
    } else if (type === "quiz" && moduleId) {
      const data = result.object as z.infer<typeof QuizSchema>;
      const existingQuizzes = await prisma.quiz.count({
        where: { moduleId: parseInt(moduleId) },
      });

      savedContent = await prisma.quiz.create({
        data: {
          title: data.title,
          description: data.description,
          moduleId: parseInt(moduleId),
          position: existingQuizzes + 1,
          creatorId: session.user.id,
          questions: {
            create: data.questions.map((question, qIndex) => ({
              question: question.question,
              explanation: question.explanation,
              position: qIndex + 1,
              answers: {
                create: question.answers.map((answer) => ({
                  answer: answer.answer,
                  isCorrect: answer.isCorrect,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      });
    } else if (type === "project" && moduleId) {
      const data = result.object as z.infer<typeof ProjectSchema>;
      const existingProjects = await prisma.project.count({
        where: { moduleId: parseInt(moduleId) },
      });

      savedContent = await prisma.project.create({
        data: {
          title: data.title,
          description: data.description,
          notionContent: data.notionContent,
          moduleId: parseInt(moduleId),
          position: existingProjects + 1,
          creatorId: session.user.id,
          tasks: {
            create: data.tasks.map((task, tIndex) => ({
              title: task.title,
              description: task.description,
              taskType: task.taskType,
              codeType: task.codeType,
              position: tIndex + 1,
              initialHTMLCode: task.initialHTMLCode,
              initialCSSCode: task.initialCSSCode,
              initialJSCode: task.initialJSCode,
              initialPythonCode: task.initialPythonCode,
              instructions: {
                create: task.instructions.map((instruction, insIndex) => ({
                  title: instruction.title,
                  body: instruction.body,
                  position: insIndex + 1,
                  answers: {
                    create: {
                      htmlAnswer: instruction.htmlAnswer,
                      cssAnswer: instruction.cssAnswer,
                      jsAnswer: instruction.jsAnswer,
                      pythonAnswer: instruction.pythonAnswer,
                    },
                  },
                })),
              },
            })),
          },
        },
        include: {
          tasks: {
            include: {
              instructions: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });
    }

    return Response.json({
      success: true,
      content: savedContent,
      raw: result.object,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
