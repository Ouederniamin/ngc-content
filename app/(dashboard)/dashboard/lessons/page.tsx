import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, BookOpen, ArrowRight, Calendar, Layers } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

interface Lesson {
  id: number;
  title: string;
  createdAt: Date;
  exercises: unknown[];
  module: {
    title: string;
    unit: {
      title: string;
      skillPath: {
        title: string;
      };
    };
  };
}

export default async function LessonsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const lessons = await prisma.lesson.findMany({
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
      exercises: true,
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
            Lessons
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI-generated lessons
          </p>
        </div>
        <Link href="/dashboard/lessons/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Lesson
          </Button>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-6">
              <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="mb-2">No Lessons Yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Create lessons with theory content and hands-on coding exercises.
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
          {lessons.map((lesson: Lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{lesson.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {lesson.module.unit.skillPath.title} → {lesson.module.unit.title} → {lesson.module.title}
                      </CardDescription>
                    </div>
                  </div>
                  <Link href={`/dashboard/lessons/${lesson.id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.exercises.length} Exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
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
