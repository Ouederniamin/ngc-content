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
  FileText,
  Clock,
  Sparkles,
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

interface ScrimbaScript {
  id: number;
  title: string;
  content: string;
  style: string;
  isActive: boolean;
  variationNumber: number;
  generatedAt: string;
  updatedAt: string;
  lessonId: number;
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
}

export default function EditScrimbaScriptPage() {
  const router = useRouter();
  const params = useParams();
  const scriptId = params.id as string;

  const [script, setScript] = useState<ScrimbaScript | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");

  // Fetch script data
  useEffect(() => {
    async function fetchScript() {
      try {
        const response = await fetch(`/api/scrimba-scripts/${scriptId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch script");
        }
        const data = await response.json();
        setScript(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load script");
      } finally {
        setIsLoading(false);
      }
    }

    fetchScript();
  }, [scriptId]);

  // Track changes
  useEffect(() => {
    if (script) {
      setHasChanges(title !== script.title || content !== script.content);
    }
  }, [title, content, script]);

  const handleSave = useCallback(async () => {
    if (!script) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/scrimba-scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save script");
      }

      const updatedScript = await response.json();
      setScript({ ...script, ...updatedScript, lesson: script.lesson });
      setSaveSuccess(true);
      setHasChanges(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [script, title, content]);

  const handleSetActive = useCallback(async () => {
    if (!script) return;

    setIsSettingActive(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrimba-scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set as active");
      }

      setScript({ ...script, isActive: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set active");
    } finally {
      setIsSettingActive(false);
    }
  }, [script]);

  const handleDelete = useCallback(async () => {
    if (!script) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrimba-scripts/${script.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete script");
      }

      router.push(`/dashboard/lessons/${script.lessonId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  }, [script, router]);

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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-violet-600" />
          <p className="text-gray-500">Loading script...</p>
        </div>
      </div>
    );
  }

  if (error && !script) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Script Not Found</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/dashboard/lessons">
            <Button>Back to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!script) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and breadcrumb */}
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/lessons/${script.lessonId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lesson
                </Button>
              </Link>
              <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="truncate max-w-[120px]">{script.lesson.module.unit.skillPath.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[120px]">{script.lesson.module.unit.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[120px]">{script.lesson.module.title}</span>
                <span className="mx-2">›</span>
                <span className="truncate max-w-[100px] font-medium text-gray-700 dark:text-gray-300">{script.lesson.title}</span>
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

              {/* Set Active button */}
              {!script.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetActive}
                  disabled={isSettingActive}
                >
                  {isSettingActive ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Set Active
                </Button>
              )}

              {/* Save button */}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-violet-600 hover:bg-violet-700"
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
                    <AlertDialogTitle>Delete Scrimba Script?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{script.title}". This action cannot be undone.
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
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Script Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Style
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {script.style}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Variation
                  </label>
                  <p className="mt-1 text-sm font-medium">#{script.variationNumber}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="mt-1">
                    {script.isActive ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(script.generatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(script.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Lesson
                  </label>
                  <Link
                    href={`/dashboard/lessons/${script.lessonId}`}
                    className="mt-1 block text-sm text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    {script.lesson.title}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter script title..."
                className="text-lg font-medium"
              />
            </div>

            {/* Content Editor with Preview Toggle */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
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
                    content={content}
                    onChange={setContent}
                    placeholder="Write your scrimba script content here... Add explanations, code examples, highlights, and more."
                    className="min-h-[600px]"
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <Card className="min-h-[600px]">
                    <CardContent className="p-6">
                      <RichTextViewer content={content} />
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
