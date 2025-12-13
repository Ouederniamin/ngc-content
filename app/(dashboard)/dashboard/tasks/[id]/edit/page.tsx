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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Code,
  ListChecks,
  FileCode,
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

interface TaskInstructionAnswer {
  id: number;
  htmlAnswer: string | null;
  cssAnswer: string | null;
  jsAnswer: string | null;
  pythonAnswer: string | null;
}

interface TaskInstruction {
  id: number;
  title: string;
  body: string | null;
  position: number;
  answers: TaskInstructionAnswer[];
}

interface ProjectTask {
  id: number;
  title: string;
  description: string | null;
  notionContent: string | null;
  taskType: string;
  codeType: string | null;
  position: number;
  initialHTMLCode: string | null;
  initialCSSCode: string | null;
  initialJSCode: string | null;
  initialPythonCode: string | null;
  instructions: TaskInstruction[];
  project: {
    id: number;
    title: string;
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
  };
}

const CODE_TYPES = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "html-css", label: "HTML + CSS" },
  { value: "html-js", label: "HTML + JS" },
  { value: "html-css-js", label: "HTML + CSS + JS" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

const TASK_TYPES = [
  { value: "CODE", label: "Code" },
  { value: "IMAGE", label: "Image" },
  { value: "TEXT", label: "Text" },
];

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<ProjectTask | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notionContent, setNotionContent] = useState("");
  const [taskType, setTaskType] = useState("CODE");
  const [codeType, setCodeType] = useState("html-css");
  const [initialHTMLCode, setInitialHTMLCode] = useState("");
  const [initialCSSCode, setInitialCSSCode] = useState("");
  const [initialJSCode, setInitialJSCode] = useState("");
  const [initialPythonCode, setInitialPythonCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");

  // Fetch task data
  const fetchTask = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }
      const data = await response.json();
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setNotionContent(data.notionContent || "");
      setTaskType(data.taskType || "CODE");
      setCodeType(data.codeType || "html-css");
      setInitialHTMLCode(data.initialHTMLCode || "");
      setInitialCSSCode(data.initialCSSCode || "");
      setInitialJSCode(data.initialJSCode || "");
      setInitialPythonCode(data.initialPythonCode || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Track changes
  useEffect(() => {
    if (task) {
      const changed =
        title !== task.title ||
        description !== (task.description || "") ||
        notionContent !== (task.notionContent || "") ||
        taskType !== task.taskType ||
        codeType !== (task.codeType || "html-css") ||
        initialHTMLCode !== (task.initialHTMLCode || "") ||
        initialCSSCode !== (task.initialCSSCode || "") ||
        initialJSCode !== (task.initialJSCode || "") ||
        initialPythonCode !== (task.initialPythonCode || "");
      setHasChanges(changed);
    }
  }, [
    title,
    description,
    notionContent,
    taskType,
    codeType,
    initialHTMLCode,
    initialCSSCode,
    initialJSCode,
    initialPythonCode,
    task,
  ]);

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
  }, [hasChanges, isSaving]);

  const handleSave = async () => {
    if (!task) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          notionContent,
          taskType,
          codeType,
          initialHTMLCode,
          initialCSSCode,
          initialJSCode,
          initialPythonCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      const updatedTask = await response.json();
      setTask({ ...task, ...updatedTask });
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
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.push(`/dashboard/projects/${task?.project.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleAddInstruction = async () => {
    if (!task) return;

    try {
      setIsAddingInstruction(true);
      const response = await fetch(`/api/tasks/${taskId}/instructions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Step",
          body: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add instruction");
      }

      // Refresh task data
      await fetchTask();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add instruction");
    } finally {
      setIsAddingInstruction(false);
    }
  };

  const handleDeleteInstruction = async (instructionId: number) => {
    try {
      const response = await fetch(`/api/task-instructions/${instructionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete instruction");
      }

      // Refresh task data
      await fetchTask();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete instruction"
      );
    }
  };

  // Determine which code editors to show based on codeType
  const showHTML = codeType?.includes("html");
  const showCSS = codeType?.includes("css");
  const showJS = codeType?.includes("js") || codeType === "javascript";
  const showPython = codeType === "python";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!task) return null;

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
                    href={`/dashboard/skill-paths/${task.project.module.unit.skillPath.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {task.project.module.unit.skillPath.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/projects/${task.project.id}/edit`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {task.project.title}
                  </Link>
                </div>
                <h1 className="text-lg font-semibold truncate">
                  Edit Task #{task.position}
                </h1>
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
                    <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this task and all its
                      instructions. This action cannot be undone.
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="gap-2">
              <Edit className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="h-4 w-4" />
              Starter Code
            </TabsTrigger>
            <TabsTrigger value="instructions" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Instructions ({task.instructions.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Task Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title"
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
                    <div className="space-y-2">
                      <Label htmlFor="taskType">Task Type</Label>
                      <Select value={taskType} onValueChange={setTaskType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codeType">Code Type</Label>
                      <Select value={codeType} onValueChange={setCodeType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CODE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Task Content (Rich Text)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={notionContent}
                      onChange={setNotionContent}
                      placeholder="Detailed task instructions..."
                      className="min-h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Starter Code Tab */}
          <TabsContent value="code">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showHTML && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Initial HTML
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={initialHTMLCode}
                      onChange={(e) => setInitialHTMLCode(e.target.value)}
                      placeholder="<!DOCTYPE html>..."
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              )}

              {showCSS && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Initial CSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={initialCSSCode}
                      onChange={(e) => setInitialCSSCode(e.target.value)}
                      placeholder="/* CSS styles */"
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              )}

              {showJS && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Initial JavaScript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={initialJSCode}
                      onChange={(e) => setInitialJSCode(e.target.value)}
                      placeholder="// JavaScript code"
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              )}

              {showPython && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Initial Python
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={initialPythonCode}
                      onChange={(e) => setInitialPythonCode(e.target.value)}
                      placeholder="# Python code"
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              )}

              {!showHTML && !showCSS && !showJS && !showPython && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Select a code type to see starter code editors
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Step-by-Step Instructions
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleAddInstruction}
                  disabled={isAddingInstruction}
                >
                  {isAddingInstruction ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add Step
                </Button>
              </CardHeader>
              <CardContent>
                {task.instructions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No instructions yet</p>
                    <p className="text-sm">
                      Click &quot;Add Step&quot; to create step-by-step
                      instructions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {task.instructions.map((instruction, index) => (
                      <div
                        key={instruction.id}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                            <GripVertical className="h-4 w-4 cursor-grab" />
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1">
                              {instruction.title}
                            </p>
                            {instruction.body && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                <RichTextViewer content={instruction.body} />
                              </div>
                            )}
                            {instruction.answers.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {instruction.answers[0].htmlAnswer && (
                                  <Badge variant="outline" className="text-xs">
                                    HTML ✓
                                  </Badge>
                                )}
                                {instruction.answers[0].cssAnswer && (
                                  <Badge variant="outline" className="text-xs">
                                    CSS ✓
                                  </Badge>
                                )}
                                {instruction.answers[0].jsAnswer && (
                                  <Badge variant="outline" className="text-xs">
                                    JS ✓
                                  </Badge>
                                )}
                                {instruction.answers[0].pythonAnswer && (
                                  <Badge variant="outline" className="text-xs">
                                    Python ✓
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={`/dashboard/task-instructions/${instruction.id}/edit`}
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
                                    Delete Instruction?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete this instruction step. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteInstruction(instruction.id)
                                    }
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
