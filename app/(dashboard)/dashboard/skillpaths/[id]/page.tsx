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
  Edit,
  Trash2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Module {
  lessons: unknown[];
  quizzes: unknown[];
  projects: unknown[];
}

interface Unit {
  modules: Module[];
}

export default async function SkillPathDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const skillPath = await prisma.skillPath.findUnique({
    where: {
      id: parseInt(id),
      creatorId: session.user.id,
    },
    include: {
      units: {
        include: {
          modules: {
            include: {
              lessons: true,
              quizzes: true,
              projects: true,
            },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!skillPath) {
    notFound();
  }

  const totalModules = skillPath.units.reduce(
    (acc: number, unit: Unit) => acc + unit.modules.length,
    0
  );
  const totalLessons = skillPath.units.reduce(
    (acc: number, unit: Unit) =>
      acc + unit.modules.reduce((m: number, mod: Module) => m + mod.lessons.length, 0),
    0
  );
  const totalQuizzes = skillPath.units.reduce(
    (acc: number, unit: Unit) =>
      acc + unit.modules.reduce((m: number, mod: Module) => m + mod.quizzes.length, 0),
    0
  );
  const totalProjects = skillPath.units.reduce(
    (acc: number, unit: Unit) =>
      acc + unit.modules.reduce((m: number, mod: Module) => m + mod.projects.length, 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/skillpaths">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  skillPath.isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {skillPath.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {skillPath.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              {skillPath.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Units", value: skillPath.units.length, icon: Layers },
          { label: "Modules", value: totalModules, icon: BookOpen },
          { label: "Lessons", value: totalLessons, icon: BookOpen },
          { label: "Quizzes", value: totalQuizzes, icon: HelpCircle },
          { label: "Projects", value: totalProjects, icon: FolderKanban },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <stat.icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
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

      {/* Units */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Units & Modules
          </h2>
        </div>

        {skillPath.units.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No units created yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {skillPath.units.map((unit, unitIndex) => (
              <Card key={unit.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Unit {unitIndex + 1}: {unit.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {unit.description}
                      </CardDescription>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {unit.modules.length} modules
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {unit.modules.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No modules in this unit
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {unit.modules.map((module, modIndex) => (
                        <Link
                          key={module.id}
                          href={`/dashboard/modules/${module.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm font-medium text-violet-600 dark:text-violet-400">
                              {unitIndex + 1}.{modIndex + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {module.title}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {module.lessons.length} lessons
                                </span>
                                <span className="flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3" />
                                  {module.quizzes.length} quizzes
                                </span>
                                <span className="flex items-center gap-1">
                                  <FolderKanban className="w-3 h-3" />
                                  {module.projects.length} projects
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Meta info */}
      <Card>
        <CardContent className="flex items-center gap-6 p-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created {new Date(skillPath.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Updated {new Date(skillPath.updatedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
