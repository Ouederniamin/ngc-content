import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, HelpCircle, ArrowRight, Calendar, Layers } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

interface Quiz {
  id: number;
  title: string;
  createdAt: Date;
  module: {
    title: string;
    unit: {
      title: string;
      skillPath: {
        title: string;
      };
    };
  };
  questions: unknown[];
}

export default async function QuizzesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const quizzes = await prisma.quiz.findMany({
    where: {
      creatorId: session.user.id,
    },
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
      questions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI-generated quizzes
          </p>
        </div>
        <Link href="/dashboard/quizzes/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900/30 mb-6">
              <HelpCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mb-2">No Quizzes Yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Create multiple-choice quizzes to test knowledge retention.
              You need to create a SkillPath with modules first.
            </CardDescription>
            <Link href="/dashboard/skillpaths">
              <Button>
                <Layers className="w-4 h-4 mr-2" />
                Go to SkillPaths
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz: Quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {quiz.module.unit.skillPath.title} → {quiz.module.unit.title} → {quiz.module.title}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/dashboard/quizzes/${quiz.id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
