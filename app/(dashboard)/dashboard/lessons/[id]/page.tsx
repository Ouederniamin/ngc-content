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

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Instruction {
  id: number;
  title: string;
  position: number;
  answers: unknown[];
}

interface TheoryVariation {
  id: number;
  title: string;
  content: string;
  style: string;
  isActive: boolean;
  position: number;
  generatedAt: Date;
}

interface Exercise {
  id: number;
  title: string;
  codeType: string;
  position: number;
  instructions: Instruction[];
  theoryVariations: TheoryVariation[];
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
          theoryVariations: {
            orderBy: {
              position: "asc",
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

      {/* Theory Content */}
      {lesson.notionContent && (
        <Card>
          <CardHeader>
            <CardTitle>Theory Content</CardTitle>
            <CardDescription>
              Lesson content displayed to students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.notionContent }}
            />
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          <CardDescription>
            Hands-on coding exercises for this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lesson.exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No exercises yet
            </div>
          ) : (
            <div className="space-y-6">
              {lesson.exercises.map((exercise: Exercise, index: number) => (
                <div
                  key={exercise.id}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {exercise.title}
                    </h3>
                    <Badge variant="outline">{exercise.codeType}</Badge>
                  </div>
                  
                  {exercise.instructions.length > 0 && (
                    <div className="ml-11 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instructions:
                      </p>
                      <ul className="space-y-2">
                        {exercise.instructions.map((instruction: Instruction, iIndex: number) => (
                          <li key={instruction.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                              {iIndex + 1}
                            </span>
                            <span>{instruction.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Theory Variations */}
                  <div className="ml-11 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Theory Variations ({exercise.theoryVariations.length})
                        </p>
                      </div>
                      <Link href={`/dashboard/lessons/${lesson.id}/exercises/${exercise.id}/generate-theory`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generate Variation
                        </Button>
                      </Link>
                    </div>
                    
                    {exercise.theoryVariations.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No theory variations yet. Generate AI-powered variations for different learning styles.
                      </p>
                    ) : (
                      <div className="grid gap-2">
                        {exercise.theoryVariations.map((variation: TheoryVariation) => (
                          <div
                            key={variation.id}
                            className={`p-3 rounded-lg border ${
                              variation.isActive 
                                ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20" 
                                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {variation.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {variation.style}
                                </Badge>
                                {variation.isActive && (
                                  <Badge variant="success" className="text-xs">Active</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(variation.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div 
                              className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 prose dark:prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: variation.content.substring(0, 200) + '...' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
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
