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
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Check,
  Edit,
  Eye,
  FileCode,
  ListChecks,
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
  task: {
    id: number;
    title: string;
    codeType: string | null;
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
  };
}

export default function EditTaskInstructionPage() {
  const router = useRouter();
  const params = useParams();
  const instructionId = params.id as string;

  const [instruction, setInstruction] = useState<TaskInstruction | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [htmlAnswer, setHtmlAnswer] = useState("");
  const [cssAnswer, setCssAnswer] = useState("");
  const [jsAnswer, setJsAnswer] = useState("");
  const [pythonAnswer, setPythonAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");

  // Fetch instruction data
  const fetchInstruction = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/task-instructions/${instructionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch instruction");
      }
      const data = await response.json();
      setInstruction(data);
      setTitle(data.title);
      setBody(data.body || "");
      if (data.answers && data.answers.length > 0) {
        setHtmlAnswer(data.answers[0].htmlAnswer || "");
        setCssAnswer(data.answers[0].cssAnswer || "");
        setJsAnswer(data.answers[0].jsAnswer || "");
        setPythonAnswer(data.answers[0].pythonAnswer || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [instructionId]);

  useEffect(() => {
    fetchInstruction();
  }, [fetchInstruction]);

  // Track changes
  useEffect(() => {
    if (instruction) {
      const answer = instruction.answers?.[0];
      const changed =
        title !== instruction.title ||
        body !== (instruction.body || "") ||
        htmlAnswer !== (answer?.htmlAnswer || "") ||
        cssAnswer !== (answer?.cssAnswer || "") ||
        jsAnswer !== (answer?.jsAnswer || "") ||
        pythonAnswer !== (answer?.pythonAnswer || "");
      setHasChanges(changed);
    }
  }, [title, body, htmlAnswer, cssAnswer, jsAnswer, pythonAnswer, instruction]);

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
    if (!instruction) return;

    try {
      setIsSaving(true);
      setError(null);

      // Update instruction
      const instructionResponse = await fetch(
        `/api/task-instructions/${instructionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        }
      );

      if (!instructionResponse.ok) {
        throw new Error("Failed to save instruction");
      }

      // Update answer if exists
      if (instruction.answers?.[0]?.id) {
        const answerResponse = await fetch(
          `/api/task-instruction-answers/${instruction.answers[0].id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              htmlAnswer: htmlAnswer || null,
              cssAnswer: cssAnswer || null,
              jsAnswer: jsAnswer || null,
              pythonAnswer: pythonAnswer || null,
            }),
          }
        );

        if (!answerResponse.ok) {
          throw new Error("Failed to save answers");
        }
      }

      await fetchInstruction();
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
      const response = await fetch(`/api/task-instructions/${instructionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete instruction");
      }

      router.push(`/dashboard/tasks/${instruction?.task.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  // Determine which code editors to show based on task's codeType
  const codeType = instruction?.task.codeType || "html-css";
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

  if (error && !instruction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!instruction) return null;

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
                    href={`/dashboard/projects/${instruction.task.project.id}/edit`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {instruction.task.project.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/tasks/${instruction.task.id}/edit`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {instruction.task.title}
                  </Link>
                </div>
                <h1 className="text-lg font-semibold truncate">
                  Edit Step #{instruction.position}
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
                    <AlertDialogTitle>Delete Step?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this instruction step. This
                      action cannot be undone.
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
          {/* Instruction Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Step Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Step Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Step title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
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
                        content={body}
                        onChange={setBody}
                        placeholder="Write the step instructions..."
                        className="min-h-[200px]"
                      />
                    </TabsContent>
                    <TabsContent value="preview" className="mt-0">
                      <div className="border rounded-md p-4 min-h-[200px] bg-muted/30">
                        {body ? (
                          <RichTextViewer content={body} />
                        ) : (
                          <p className="text-muted-foreground italic">
                            No content to preview
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Answer Codes */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Expected Code Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The code state after completing this step
                </p>

                {showHTML && (
                  <div className="space-y-2">
                    <Label htmlFor="htmlAnswer">HTML Answer</Label>
                    <Textarea
                      id="htmlAnswer"
                      value={htmlAnswer}
                      onChange={(e) => setHtmlAnswer(e.target.value)}
                      placeholder="<!DOCTYPE html>..."
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                )}

                {showCSS && (
                  <div className="space-y-2">
                    <Label htmlFor="cssAnswer">CSS Answer</Label>
                    <Textarea
                      id="cssAnswer"
                      value={cssAnswer}
                      onChange={(e) => setCssAnswer(e.target.value)}
                      placeholder="/* CSS */"
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                )}

                {showJS && (
                  <div className="space-y-2">
                    <Label htmlFor="jsAnswer">JavaScript Answer</Label>
                    <Textarea
                      id="jsAnswer"
                      value={jsAnswer}
                      onChange={(e) => setJsAnswer(e.target.value)}
                      placeholder="// JavaScript"
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                )}

                {showPython && (
                  <div className="space-y-2">
                    <Label htmlFor="pythonAnswer">Python Answer</Label>
                    <Textarea
                      id="pythonAnswer"
                      value={pythonAnswer}
                      onChange={(e) => setPythonAnswer(e.target.value)}
                      placeholder="# Python"
                      className="font-mono text-xs min-h-[100px]"
                    />
                  </div>
                )}

                {!showHTML && !showCSS && !showJS && !showPython && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No code type configured for this task
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
