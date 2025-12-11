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
  HelpCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getQuiz(id: number, userId: string) {
  const quiz = await prisma.quiz.findFirst({
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
      questions: {
        orderBy: {
          position: "asc",
        },
        include: {
          answers: true,
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

  return quiz;
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { id } = await params;
  const quizId = parseInt(id);

  if (isNaN(quizId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const quiz = await getQuiz(quizId, session.user.id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Link
            href={`/dashboard/modules/${quiz.moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {quiz.module.title}
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <HelpCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quiz.title}
                </h1>
                {quiz.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {quiz.module.unit.skillPath.title} → {quiz.module.unit.title} → {quiz.module.title}
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

      {/* Quiz Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                <p className="font-semibold">{quiz.questions.length} questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-semibold">#{quiz.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {quiz.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{quiz.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Quiz questions with answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quiz.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions yet
            </div>
          ) : (
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 dark:text-white font-medium mb-4">
                    {question.question}
                  </p>

                  {question.answers.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            answer.isCorrect
                              ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                              : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          {answer.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={answer.isCorrect ? "text-green-700 dark:text-green-300" : ""}>
                            {answer.answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
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
