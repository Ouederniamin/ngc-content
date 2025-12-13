import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Code,
  Edit,
  Trash2,
  ListChecks,
  Sparkles,
  FileText,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GenerateAnswersButton } from "@/components/generate-answers-button";
import { EditableExerciseContent } from "@/components/editable-exercise-content";
import { RichTextViewer } from "@/components/rich-text-editor";

interface PageProps {
  params: Promise<{ id: string; exerciseId: string }>;
}

interface Answer {
  id: number;
  htmlAnswer: string | null;
  cssAnswer: string | null;
  jsAnswer: string | null;
  pythonAnswer: string | null;
}

interface Instruction {
  id: number;
  title: string;
  body: string | null;
  position: number;
  answers: Answer[];
}

async function getExercise(lessonId: number, exerciseId: number, userId: string) {
  const exercise = await prisma.lessonExercise.findFirst({
    where: {
      id: exerciseId,
      lessonId: lessonId,
      lesson: {
        module: {
          unit: {
            skillPath: {
              creatorId: userId,
            },
          },
        },
      },
    },
    include: {
      instructions: {
        orderBy: {
          position: "asc",
        },
        include: {
          answers: true,
        },
      },
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
    },
  });

  return exercise;
}

export default async function ExerciseDetailPage({ params }: PageProps) {
  const { id, exerciseId } = await params;
  const lessonId = parseInt(id);
  const exId = parseInt(exerciseId);

  if (isNaN(lessonId) || isNaN(exId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const exercise = await getExercise(lessonId, exId, session.user.id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Link
            href={`/dashboard/lessons/${lessonId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {exercise.lesson.title}
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Code className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {exercise.title}
                </h1>
                <Badge variant="outline">{exercise.codeType}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {exercise.lesson.module.unit.skillPath.title} → {exercise.lesson.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/lessons/${lessonId}/exercises/${exId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Exercise Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-semibold">#{exercise.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Code Type</p>
                <p className="font-semibold">{exercise.codeType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ListChecks className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructions</p>
                <p className="font-semibold">{exercise.instructions.length} steps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Description */}
      {exercise.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercise Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercise Content</CardTitle>
              <CardDescription>
                Add text, code examples, and instructions for students. Click to edit like Notion.
              </CardDescription>
            </div>
            <Link href={`/dashboard/lessons/${lessonId}/exercises/${exId}/generate-content`}>
              <Button size="sm" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <EditableExerciseContent
            exerciseId={exercise.id}
            initialContent={exercise.content}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Step-by-step instructions for completing this exercise
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <GenerateAnswersButton
                exerciseId={exercise.id}
                codeType={exercise.codeType}
                hasInstructions={exercise.instructions.length > 0}
              />
              <Link href={`/dashboard/lessons/${lessonId}/exercises/${exId}/instructions/new`}>
                <Button size="sm" variant="outline">
                  <ListChecks className="w-4 h-4 mr-2" />
                  Add Instruction
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exercise.instructions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No instructions yet.</p>
              <p className="text-sm">Add step-by-step instructions for students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercise.instructions.map((instruction: Instruction, index: number) => (
                <div
                  key={instruction.id}
                  className="p-4 border rounded-xl bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 text-white font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {instruction.title}
                        </h4>
                        <Link href={`/dashboard/instructions/${instruction.id}/edit`}>
                          <Button variant="outline" size="sm" className="shrink-0">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                            <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                          </Button>
                        </Link>
                      </div>
                      {instruction.body && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 prose prose-sm dark:prose-invert max-w-none">
                          <RichTextViewer content={instruction.body} className="prose-sm" />
                        </div>
                      )}
                      
                      {/* Answers */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Expected Answer
                          </p>
                          {instruction.answers.length > 0 && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {instruction.answers.length === 0 ? (
                          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No answer generated yet
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Click &quot;Generate All Answers&quot; above to create expected answers
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            {instruction.answers.map((answer: Answer) => (
                              <div
                                key={answer.id}
                                className="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 overflow-x-auto"
                              >
                                {answer.htmlAnswer && (
                                  <div className="mb-3">
                                    <Badge className="mb-2 bg-orange-500/20 text-orange-400 border-orange-500/30">HTML</Badge>
                                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{answer.htmlAnswer}</pre>
                                  </div>
                                )}
                                {answer.cssAnswer && (
                                  <div className="mb-3">
                                    <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30">CSS</Badge>
                                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{answer.cssAnswer}</pre>
                                  </div>
                                )}
                                {answer.jsAnswer && (
                                  <div className="mb-3">
                                    <Badge className="mb-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">JavaScript</Badge>
                                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{answer.jsAnswer}</pre>
                                  </div>
                                )}
                                {answer.pythonAnswer && (
                                  <div>
                                    <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-500/30">Python</Badge>
                                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">{answer.pythonAnswer}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
