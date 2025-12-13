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
  BookOpen,
  Edit,
  Trash2,
  Code,
  ListChecks,
  Sparkles,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GenerateAllExercisesButton } from "@/components/generate-all-exercises-button";
import { RichTextViewer } from "@/components/rich-text-editor";
import { EditableScrimbaScript } from "@/components/editable-scrimba-script";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Instruction {
  id: number;
  title: string;
  position: number;
  answers: unknown[];
}

interface ScrimbaScript {
  id: number;
  title: string;
  content: string;
  style: string;
  isActive: boolean;
  variationNumber: number;
  generatedAt: Date;
}

interface Exercise {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  codeType: string;
  position: number;
  instructions: Instruction[];
}

async function getLesson(id: number, userId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      module: {
        unit: {
          skillPath: {
            creatorId: userId,
          },
        },
      },
    },
    include: {
      scrimbaScripts: {
        orderBy: {
          variationNumber: "asc",
        },
      },
      exercises: {
        orderBy: {
          position: "asc",
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
        },
      },
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
  });

  return lesson;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lessonId = parseInt(id);

  if (isNaN(lessonId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const lesson = await getLesson(lessonId, session.user.id);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Link
            href={`/dashboard/modules/${lesson.moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {lesson.module.title}
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h1>
                {lesson.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {lesson.module.unit.skillPath.title} → {lesson.module.unit.title} → {lesson.module.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-semibold">#{lesson.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
                <p className="font-semibold">{lesson.exercises.length} exercises</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Instructions</p>
                <p className="font-semibold">
                  {lesson.exercises.reduce((acc: number, ex: { instructions: unknown[] }) => acc + ex.instructions.length, 0)} steps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrimba Scripts (Theory Content) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scrimba Scripts</CardTitle>
              <CardDescription>
                AI-generated theory content variations for different learning styles
              </CardDescription>
            </div>
            <Link href={`/dashboard/lessons/${lesson.id}/generate-theory`}>
              <Button size="sm" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Script
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {(!lesson.scrimbaScripts || lesson.scrimbaScripts.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scrimba scripts yet.</p>
              <p className="text-sm">Generate AI-powered theory content for different learning styles.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {lesson.scrimbaScripts.map((script: ScrimbaScript) => (
                <EditableScrimbaScript
                  key={script.id}
                  script={{
                    ...script,
                    generatedAt: script.generatedAt.toISOString(),
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                Hands-on coding exercises for this lesson
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <GenerateAllExercisesButton
                lessonId={lesson.id}
                exercises={lesson.exercises.map((ex: Exercise) => ({
                  id: ex.id,
                  title: ex.title,
                  codeType: ex.codeType,
                }))}
              />
              <Link href={`/dashboard/lessons/${lesson.id}/exercises/new`}>
                <Button size="sm" variant="outline">
                  <Code className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lesson.exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No exercises yet.</p>
              <p className="text-sm">Create hands-on coding exercises for students to practice.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {lesson.exercises.map((exercise: Exercise, index: number) => (
                <div
                  key={exercise.id}
                  className="p-5 border rounded-xl bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {exercise.title}
                        </h3>
                        <Badge variant="outline" className="mt-1">{exercise.codeType}</Badge>
                      </div>
                    </div>
                    <Link href={`/dashboard/lessons/${lesson.id}/exercises/${exercise.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Exercise Description */}
                  {exercise.description && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {exercise.description}
                      </p>
                    </div>
                  )}

                  {/* Exercise Content */}
                  {exercise.content && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Exercise Content
                      </p>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <RichTextViewer content={exercise.content} />
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {exercise.instructions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Instructions ({exercise.instructions.length} steps)
                      </p>
                      <div className="space-y-2">
                        {exercise.instructions.map((instruction: Instruction, iIndex: number) => (
                          <div 
                            key={instruction.id} 
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                          >
                            <span className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-medium">
                              {iIndex + 1}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{instruction.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
