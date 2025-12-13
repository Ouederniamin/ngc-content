"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { RichTextEditor, RichTextViewer } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Check,
  Eye,
  Edit,
  ListChecks,
  Clock,
  Code,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
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

interface Answer {
  id: number;
  htmlAnswer: string | null;
  cssAnswer: string | null;
  jsAnswer: string | null;
  pythonAnswer: string | null;
}

interface Instruction {
  id: number;
  title: string;
  body: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  exerciseId: number;
  answers: Answer[];
  exercise: {
    id: number;
    title: string;
    codeType: string;
    lesson: {
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

export default function EditInstructionPage() {
  const router = useRouter();
  const params = useParams();
  const instructionId = params.id as string;

  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");

  // Fetch instruction data
  useEffect(() => {
    async function fetchInstruction() {
      try {
        const response = await fetch(`/api/instructions/${instructionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch instruction");
        }
        const data = await response.json();
        setInstruction(data);
        setTitle(data.title);
        setBody(data.body || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load instruction");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstruction();
  }, [instructionId]);

  // Track changes
  useEffect(() => {
    if (instruction) {
      const originalBody = instruction.body || "";
      setHasChanges(title !== instruction.title || body !== originalBody);
    }
  }, [title, body, instruction]);

  const handleSave = useCallback(async () => {
    if (!instruction) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/instructions/${instruction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        throw new Error("Failed to save instruction");
      }

      const updatedInstruction = await response.json();
      setInstruction({ ...instruction, ...updatedInstruction, exercise: instruction.exercise });
      setSaveSuccess(true);
      setHasChanges(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [instruction, title, body]);

  const handleDelete = useCallback(async () => {
    if (!instruction) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/instructions/${instruction.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete instruction");
      }

      router.push(`/dashboard/lessons/${instruction.exercise.lesson.id}/exercises/${instruction.exerciseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  }, [instruction, router]);

  // Keyboard shortcut for saving
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
  }, [hasChanges, isSaving, handleSave]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-500">Loading instruction...</p>
        </div>
      </div>
    );
  }

  if (error && !instruction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ListChecks className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Instruction Not Found</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/dashboard/lessons">
            <Button>Back to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!instruction) return null;

  const codeTypeColors: Record<string, string> = {
    html: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
    css: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    javascript: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    python: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
    "html-css": "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    "html-css-js": "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and breadcrumb */}
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/lessons/${instruction.exercise.lesson.id}/exercises/${instruction.exerciseId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Exercise
                </Button>
              </Link>
              <div className="hidden lg:flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="truncate max-w-[100px]">{instruction.exercise.lesson.module.unit.skillPath.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[80px]">{instruction.exercise.lesson.module.unit.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[80px]">{instruction.exercise.lesson.module.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[80px]">{instruction.exercise.lesson.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[80px] font-medium text-gray-700 dark:text-gray-300">{instruction.exercise.title}</span>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Save status */}
              {saveSuccess && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
              {hasChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}

              {/* Save button */}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Instruction?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete Step {instruction.position}: "{instruction.title}" and all its answers. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instruction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Step Number
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 text-white font-bold text-sm">
                      {instruction.position}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Exercise
                  </label>
                  <Link
                    href={`/dashboard/lessons/${instruction.exercise.lesson.id}/exercises/${instruction.exerciseId}`}
                    className="mt-1 block text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    {instruction.exercise.title}
                  </Link>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Code Type
                  </label>
                  <div className="mt-1">
                    <Badge className={codeTypeColors[instruction.exercise.codeType] || "bg-gray-500/20"}>
                      <Code className="w-3 h-3 mr-1" />
                      {instruction.exercise.codeType.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Answer Status
                  </label>
                  <div className="mt-1">
                    {instruction.answers.length > 0 ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Has Answer
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        No Answer Yet
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(instruction.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Expected Answer Card */}
            {instruction.answers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Expected Answer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {instruction.answers.map((answer) => (
                    <div key={answer.id} className="space-y-3">
                      {answer.htmlAnswer && (
                        <div>
                          <Badge className="mb-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">
                            HTML
                          </Badge>
                          <pre className="p-3 bg-gray-900 rounded-lg text-xs text-gray-100 font-mono overflow-x-auto max-h-32">
                            {answer.htmlAnswer}
                          </pre>
                        </div>
                      )}
                      {answer.cssAnswer && (
                        <div>
                          <Badge className="mb-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                            CSS
                          </Badge>
                          <pre className="p-3 bg-gray-900 rounded-lg text-xs text-gray-100 font-mono overflow-x-auto max-h-32">
                            {answer.cssAnswer}
                          </pre>
                        </div>
                      )}
                      {answer.jsAnswer && (
                        <div>
                          <Badge className="mb-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                            JavaScript
                          </Badge>
                          <pre className="p-3 bg-gray-900 rounded-lg text-xs text-gray-100 font-mono overflow-x-auto max-h-32">
                            {answer.jsAnswer}
                          </pre>
                        </div>
                      )}
                      {answer.pythonAnswer && (
                        <div>
                          <Badge className="mb-2 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                            Python
                          </Badge>
                          <pre className="p-3 bg-gray-900 rounded-lg text-xs text-gray-100 font-mono overflow-x-auto max-h-32">
                            {answer.pythonAnswer}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step Header */}
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-emerald-500 text-white font-bold text-lg shadow-lg">
                {instruction.position}
              </span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instruction Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Add the HTML structure..."
                  className="text-lg font-medium"
                />
              </div>
            </div>

            {/* Body Editor with Preview Toggle */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instruction Body <span className="text-gray-400 font-normal">(detailed explanation)</span>
                  </label>
                  <TabsList className="h-8">
                    <TabsTrigger value="edit" className="text-xs px-3 h-7">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs px-3 h-7">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="edit" className="mt-0">
                  <RichTextEditor
                    content={body}
                    onChange={setBody}
                    placeholder="Write detailed instructions here... Explain what students need to do, add code examples, tips, and more."
                    className="min-h-[500px]"
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <Card className="min-h-[500px]">
                    <CardContent className="p-6">
                      {body ? (
                        <RichTextViewer content={body} />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No content yet. Switch to Edit mode to add instructions.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Keyboard shortcut hint */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">S</kbd> to save
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
