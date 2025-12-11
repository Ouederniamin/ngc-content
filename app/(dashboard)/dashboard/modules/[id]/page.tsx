import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Layers,
  BookOpen,
  HelpCircle,
  FolderKanban,
  Plus,
  ChevronRight,
  Calendar,
  Sparkles,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
}

interface Quiz {
  id: number;
  title: string;
}

interface Project {
  id: number;
  title: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const module = await prisma.module.findUnique({
    where: {
      id: parseInt(id),
      creatorId: session.user.id,
    },
    include: {
      unit: {
        include: {
          skillPath: true,
        },
      },
      lessons: {
        orderBy: { position: "asc" },
      },
      quizzes: {
        orderBy: { position: "asc" },
      },
      projects: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!module) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href={`/dashboard/skillpaths/${module.unit.skillPath.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Unit {module.unit.position}: {module.unit.title}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {module.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Lessons",
            value: module.lessons.length,
            icon: BookOpen,
            color: "from-blue-500 to-cyan-600",
          },
          {
            label: "Quizzes",
            value: module.quizzes.length,
            icon: HelpCircle,
            color: "from-green-500 to-emerald-600",
          },
          {
            label: "Projects",
            value: module.projects.length,
            icon: FolderKanban,
            color: "from-orange-500 to-red-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid gap-6">
        {/* Lessons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Lessons</CardTitle>
                  <CardDescription>
                    Theory content with coding exercises
                  </CardDescription>
                </div>
              </div>
              <Link href={`/dashboard/lessons/create?moduleId=${module.id}`}>
                <Button size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Lesson
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {module.lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No lessons yet. Generate your first lesson with AI!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {module.lessons.map((lesson: Lesson, index: number) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {lesson.title}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quizzes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Quizzes</CardTitle>
                  <CardDescription>
                    Multiple choice assessments
                  </CardDescription>
                </div>
              </div>
              <Link href={`/dashboard/quizzes/create?moduleId=${module.id}`}>
                <Button size="sm" variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {module.quizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No quizzes yet. Generate your first quiz with AI!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {module.quizzes.map((quiz: Quiz, index: number) => (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-medium text-green-600 dark:text-green-400">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {quiz.title}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    Hands-on capstone projects
                  </CardDescription>
                </div>
              </div>
              <Link href={`/dashboard/projects/create?moduleId=${module.id}`}>
                <Button size="sm" variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Project
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {module.projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No projects yet. Generate your first project with AI!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {module.projects.map((project: Project, index: number) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-400">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
