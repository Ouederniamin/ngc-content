import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FolderKanban,
  Layers,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";

async function getStats(userId: string) {
  const [skillPaths, lessons, quizzes, projects] = await Promise.all([
    prisma.skillPath.count({ where: { creatorId: userId } }),
    prisma.lesson.count({
      where: { module: { unit: { skillPath: { creatorId: userId } } } },
    }),
    prisma.quiz.count({
      where: { module: { unit: { skillPath: { creatorId: userId } } } },
    }),
    prisma.project.count({
      where: { module: { unit: { skillPath: { creatorId: userId } } } },
    }),
  ]);

  return { skillPaths, lessons, quizzes, projects };
}

const contentTypes = [
  {
    title: "Create SkillPath",
    description: "Generate a complete learning path with units and modules",
    icon: Layers,
    href: "/dashboard/skillpaths/create",
    color: "from-violet-500 to-purple-600",
    stats: "Complete learning journey",
  },
  {
    title: "Create Lesson",
    description: "Generate lessons with theory and coding exercises",
    icon: BookOpen,
    href: "/dashboard/lessons/create",
    color: "from-blue-500 to-cyan-600",
    stats: "Theory + hands-on practice",
  },
  {
    title: "Create Quiz",
    description: "Generate multiple-choice quizzes with explanations",
    icon: HelpCircle,
    href: "/dashboard/quizzes/create",
    color: "from-green-500 to-emerald-600",
    stats: "Knowledge assessment",
  },
  {
    title: "Create Project",
    description: "Generate capstone projects with multiple tasks",
    icon: FolderKanban,
    href: "/dashboard/projects/create",
    color: "from-orange-500 to-red-600",
    stats: "Real-world application",
  },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const stats = await getStats(session.user.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user.name || "Creator"}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create educational content for NextGen Coding with the power of AI
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total SkillPaths", value: stats.skillPaths.toString(), icon: Layers, href: "/dashboard/skillpaths" },
          { label: "Total Lessons", value: stats.lessons.toString(), icon: BookOpen, href: "/dashboard/lessons" },
          { label: "Total Quizzes", value: stats.quizzes.toString(), icon: HelpCircle, href: "/dashboard/quizzes" },
          { label: "Total Projects", value: stats.projects.toString(), icon: FolderKanban, href: "/dashboard/projects" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <stat.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Create Content Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Content
          </h2>
          <div className="flex items-center gap-2 text-sm text-violet-600">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentTypes.map((type) => (
            <Link key={type.title} href={type.href}>
              <Card className="group hover:shadow-lg transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}
                    >
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="mt-4">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    {type.stats}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Getting Started with AI Content Creation
              </h3>
              <p className="text-violet-100 max-w-2xl">
                Start by creating a SkillPath to organize your content. Then add
                lessons, quizzes, and projects to each module. Our AI will
                generate complete content including exercises, code answers, and
                multi-language translations.
              </p>
            </div>
            <Link href="/dashboard/skillpaths/create">
              <Button
                size="lg"
                className="bg-white text-violet-600 hover:bg-gray-100 shrink-0"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First SkillPath
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
