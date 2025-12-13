"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  XCircle,
  HelpCircle,
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

interface QuizAnswer {
  id: number;
  answer: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  explanation: string | null;
  position: number;
  answers: QuizAnswer[];
}

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  position: number;
  isPublished: boolean;
  moduleId: number;
  questions: QuizQuestion[];
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

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch quiz data
  const fetchQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }
      const data = await response.json();
      setQuiz(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setIsPublished(data.isPublished);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Track changes
  useEffect(() => {
    if (quiz) {
      const changed =
        title !== quiz.title ||
        description !== (quiz.description || "") ||
        isPublished !== quiz.isPublished;
      setHasChanges(changed);
    }
  }, [title, description, isPublished, quiz]);

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
  }, [hasChanges, isSaving, title, description, isPublished]);

  const handleSave = async () => {
    if (!quiz) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isPublished }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      const updatedQuiz = await response.json();
      setQuiz({ ...quiz, ...updatedQuiz });
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
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      router.push(`/dashboard/modules/${quiz?.moduleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz) return;

    try {
      setIsAddingQuestion(true);
      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "New Question",
          explanation: "",
          answers: [
            { answer: "Answer 1", isCorrect: true },
            { answer: "Answer 2", isCorrect: false },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      // Refresh quiz data
      await fetchQuiz();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      // Refresh quiz data
      await fetchQuiz();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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
                    href={`/dashboard/skill-paths/${quiz.module.unit.skillPath.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {quiz.module.unit.skillPath.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/units/${quiz.module.unit.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {quiz.module.unit.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/modules/${quiz.module.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {quiz.module.title}
                  </Link>
                </div>
                <h1 className="text-lg font-semibold truncate">Edit Quiz</h1>
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
                    <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this quiz and all its
                      questions and answers. This action cannot be undone.
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
          {/* Quiz Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Quiz description (optional)"
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
                  <span className="text-muted-foreground">Questions</span>
                  <Badge variant="secondary">{quiz.questions.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Answers</span>
                  <Badge variant="secondary">
                    {quiz.questions.reduce((sum, q) => sum + q.answers.length, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <Badge variant="outline">{quiz.position}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Questions ({quiz.questions.length})
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleAddQuestion}
                  disabled={isAddingQuestion}
                >
                  {isAddingQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Add Question
                </Button>
              </CardHeader>
              <CardContent>
                {quiz.questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No questions yet</p>
                    <p className="text-sm">
                      Click &quot;Add Question&quot; to create your first question
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                      <div
                        key={question.id}
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
                            <p className="font-medium mb-2 line-clamp-2">
                              {question.question}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {question.answers.map((answer) => (
                                <Badge
                                  key={answer.id}
                                  variant={answer.isCorrect ? "default" : "outline"}
                                  className={
                                    answer.isCorrect
                                      ? "bg-green-600 hover:bg-green-700"
                                      : ""
                                  }
                                >
                                  {answer.isCorrect ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  <span className="truncate max-w-[150px]">
                                    {answer.answer}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                💡 {question.explanation}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link href={`/dashboard/questions/${question.id}/edit`}>
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
                                    Delete Question?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete this question and all its
                                    answers. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteQuestion(question.id)}
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
