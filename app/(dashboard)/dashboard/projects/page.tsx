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
import { Plus, FolderKanban, CheckSquare } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getProjects() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      module: {
        unit: {
          skillPath: {
            creatorId: session.user.id,
          },
        },
      },
    },
    include: {
      tasks: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group projects by module
  type GroupedProjects = Record<string, { moduleId: number; skillPathTitle: string; projects: typeof projects }>;
  const grouped = projects.reduce((acc: GroupedProjects, project) => {
    const moduleName = project.module.title;
    if (!acc[moduleName]) {
      acc[moduleName] = {
        moduleId: project.module.id,
        skillPathTitle: project.module.unit.skillPath.title,
        projects: [],
      };
    }
    acc[moduleName].projects.push(project);
    return acc;
  }, {} as GroupedProjects);

  return grouped;
}

export default async function ProjectsPage() {
  const groupedProjects = await getProjects();
  const hasProjects = Object.keys(groupedProjects).length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI-generated capstone projects
          </p>
        </div>
        <Link href="/dashboard/projects/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </Link>
      </div>

      {!hasProjects ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 mb-6">
              <FolderKanban className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="mb-2">No Projects Yet</CardTitle>
            <CardDescription className="text-center max-w-md mb-6">
              Create capstone projects with multiple tasks that apply learned concepts.
              You need to create a SkillPath with modules first.
            </CardDescription>
            <Link href="/dashboard/projects/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProjects).map(([moduleName, { moduleId, skillPathTitle, projects }]) => (
            <div key={moduleId} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {moduleName}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {skillPathTitle}
                </Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <FolderKanban className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          {project.isPublished ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-4 h-4" />
                            <span>{project.tasks.length} tasks</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
