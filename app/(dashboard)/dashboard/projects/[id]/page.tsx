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
  FolderKanban,
  Edit,
  Trash2,
  ListChecks,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: number, userId: string) {
  const project = await prisma.project.findFirst({
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
      tasks: {
        orderBy: {
          position: "asc",
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

  return project;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const project = await getProject(projectId, session.user.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Link
            href={`/dashboard/modules/${project.moduleId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {project.module.title}
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <FolderKanban className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                {project.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {project.module.unit.skillPath.title} → {project.module.unit.title} → {project.module.title}
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

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FolderKanban className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position</p>
                <p className="font-semibold">#{project.position}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks</p>
                <p className="font-semibold">{project.tasks.length} tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Project Brief */}
      {project.notionContent && (
        <Card>
          <CardHeader>
            <CardTitle>Project Brief</CardTitle>
            <CardDescription>
              Detailed project instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: project.notionContent }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Project Tasks</CardTitle>
          <CardDescription>
            Step-by-step tasks for students to complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tasks yet
            </div>
          ) : (
            <div className="space-y-4">
              {project.tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {task.taskType}
                        </Badge>
                        {task.codeType && (
                          <Badge variant="secondary" className="text-xs">
                            {task.codeType}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {task.description}
                        </p>
                      )}
                    </div>
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
