import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Layers, ArrowRight, BookOpen, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

interface Module {
  id: number;
}

interface Unit {
  id: number;
  modules: Module[];
}

interface SkillPath {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  isPublished: boolean;
  units: Unit[];
}

export default async function SkillPathsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch user's skillpaths from database
  const skillPaths = await prisma.skillPath.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      units: {
        include: {
          modules: true,
        },
      },
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
            SkillPaths
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI-generated learning paths
          </p>
        </div>
        <Link href="/dashboard/skillpaths/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create SkillPath
          </Button>
        </Link>
      </div>

      {skillPaths.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-violet-100 dark:bg-violet-900/30 mb-6">
              <Layers className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle className="mb-2">No SkillPaths Yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Create your first SkillPath to organize your educational content
              into a structured learning journey.
            </CardDescription>
            <Link href="/dashboard/skillpaths/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First SkillPath
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {skillPaths.map((skillPath: SkillPath) => {
            const totalModules = skillPath.units.reduce(
              (acc: number, unit: Unit) => acc + unit.modules.length,
              0
            );
            
            return (
              <Card key={skillPath.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{skillPath.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {skillPath.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Link href={`/dashboard/skillpaths/${skillPath.id}`}>
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
                      <span>{skillPath.units.length} Units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>{totalModules} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(skillPath.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skillPath.isPublished 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {skillPath.isPublished ? "Published" : "Draft"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
