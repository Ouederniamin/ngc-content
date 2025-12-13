"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { RichTextEditor, RichTextViewer } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Check,
  Plus,
  GripVertical,
  Edit,
  Eye,
  FolderKanban,
  ListChecks,
  Code,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskInstruction {
  id: number;
  title: string;
  body: string | null;
  position: number;
}

interface ProjectTask {
  id: number;
  title: string;
  description: string | null;
  taskType: string;
  codeType: string | null;
  position: number;
  instructions: TaskInstruction[];
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  notionContent: string | null;
  position: number;
  isPublished: boolean;
  moduleId: number;
  tasks: ProjectTask[];
  module: {
    id: number;
    title: string;
    unit: {
      id: number;
      title: string;
      skillPath: {
        id: number;
        title: string;
      };
    };
  };
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notionContent, setNotionContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");

  // Fetch project data
  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      const data = await response.json();
      setProject(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setNotionContent(data.notionContent || "");
      setIsPublished(data.isPublished);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Track changes
  useEffect(() => {
    if (project) {
      const changed =
        title !== project.title ||
        description !== (project.description || "") ||
        notionContent !== (project.notionContent || "") ||
        isPublished !== project.isPublished;
      setHasChanges(changed);
    }
  }, [title, description, notionContent, isPublished, project]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, isSaving, title, description, notionContent, isPublished]);

  const handleSave = async () => {
    if (!project) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, notionContent, isPublished }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const updatedProject = await response.json();
      setProject({ ...project, ...updatedProject });
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      router.push(`/dashboard/modules/${project?.moduleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleAddTask = async () => {
    if (!project) return;

    try {
      setIsAddingTask(true);
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Task",
          description: "",
          taskType: "CODE",
          codeType: "html-css",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      // Refresh project data
      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Refresh project data
      await fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Link
                    href={`/dashboard/skill-paths/${project.module.unit.skillPath.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {project.module.unit.skillPath.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/units/${project.module.unit.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {project.module.unit.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/modules/${project.module.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {project.module.title}
                  </Link>
                </div>
                <h1 className="text-lg font-semibold truncate">Edit Project</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {saveSuccess && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
              {hasChanges && (
                <Badge variant="secondary" className="text-orange-600">
                  Unsaved changes
                </Badge>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this project and all its
                      tasks and instructions. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="container max-w-6xl mx-auto px-4 py-2">
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <Badge variant="secondary">{project.tasks.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Instructions
                  </span>
                  <Badge variant="secondary">
                    {project.tasks.reduce(
                      (sum, t) => sum + t.instructions.length,
                      0
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <Badge variant="outline">{project.position}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Brief & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Brief */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Brief</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-0">
                    <RichTextEditor
                      content={notionContent}
                      onChange={setNotionContent}
                      placeholder="Write the project brief..."
                      className="min-h-[200px]"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-4 min-h-[200px] bg-muted/30">
                      {notionContent ? (
                        <RichTextViewer content={notionContent} />
                      ) : (
                        <p className="text-muted-foreground italic">
                          No content to preview
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Tasks ({project.tasks.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  disabled={isAddingTask}
                >
                  {isAddingTask ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {project.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks yet</p>
                    <p className="text-sm">
                      Click &quot;Add Task&quot; to create your first task
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                            <GripVertical className="h-4 w-4 cursor-grab" />
                            <span className="text-sm font-medium w-6">
                              {index + 1}.
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{task.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {task.taskType}
                              </Badge>
                              {task.codeType && (
                                <Badge variant="secondary" className="text-xs">
                                  <Code className="h-3 w-3 mr-1" />
                                  {task.codeType}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {task.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {task.instructions.length} instruction
                              {task.instructions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/dashboard/tasks/${task.id}/edit`}
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Task?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete this task and all its
                                    instructions. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
