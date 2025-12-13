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
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Check,
  Plus,
  Eye,
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
  quiz: {
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

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [newAnswerText, setNewAnswerText] = useState("");

  // Fetch question data
  const fetchQuestion = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/questions/${questionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }
      const data = await response.json();
      setQuestion(data);
      setQuestionText(data.question);
      setExplanation(data.explanation || "");
      setAnswers(data.answers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // Track changes
  useEffect(() => {
    if (question) {
      const textChanged = questionText !== question.question;
      const explanationChanged = explanation !== (question.explanation || "");
      setHasChanges(textChanged || explanationChanged);
    }
  }, [questionText, explanation, question]);

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
  }, [hasChanges, isSaving, questionText, explanation]);

  const handleSave = async () => {
    if (!question) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          explanation: explanation || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save question");
      }

      const updatedQuestion = await response.json();
      setQuestion({ ...question, ...updatedQuestion });
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
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      router.push(`/dashboard/quizzes/${question?.quiz.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleAddAnswer = async () => {
    if (!newAnswerText.trim()) return;

    try {
      setIsAddingAnswer(true);
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: newAnswerText,
          isCorrect: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add answer");
      }

      const newAnswer = await response.json();
      setAnswers([...answers, newAnswer]);
      setNewAnswerText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add answer");
    } finally {
      setIsAddingAnswer(false);
    }
  };

  const handleUpdateAnswer = async (
    answerId: number,
    updates: { answer?: string; isCorrect?: boolean }
  ) => {
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update answer");
      }

      const updatedAnswer = await response.json();
      setAnswers(
        answers.map((a) => (a.id === answerId ? { ...a, ...updatedAnswer } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update answer");
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete answer");
      }

      setAnswers(answers.filter((a) => a.id !== answerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete answer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!question) return null;

  const correctAnswers = answers.filter((a) => a.isCorrect).length;

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
                    href={`/dashboard/skill-paths/${question.quiz.module.unit.skillPath.id}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {question.quiz.module.unit.skillPath.title}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/dashboard/quizzes/${question.quiz.id}/edit`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {question.quiz.title}
                  </Link>
                </div>
                <h1 className="text-lg font-semibold truncate">
                  Edit Question #{question.position}
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
                    <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this question and all its
                      answers. This action cannot be undone.
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
          {/* Question Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Text */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Question Text
                </CardTitle>
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
                      content={questionText}
                      onChange={setQuestionText}
                      placeholder="Enter your question here..."
                      className="min-h-[150px]"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-4 min-h-[150px] bg-muted/30">
                      {questionText ? (
                        <RichTextViewer content={questionText} />
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

            {/* Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  💡 Explanation (shown after answering)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={explanation}
                  onChange={setExplanation}
                  placeholder="Explain why the correct answer is correct..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Answers Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Answers ({answers.length})</span>
                  <Badge
                    variant={correctAnswers > 0 ? "default" : "destructive"}
                    className={
                      correctAnswers > 0 ? "bg-green-600" : ""
                    }
                  >
                    {correctAnswers} correct
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {answers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No answers yet. Add some below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {answers.map((answer) => (
                      <div
                        key={answer.id}
                        className={`border rounded-lg p-3 transition-colors ${
                          answer.isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`shrink-0 h-6 w-6 ${
                              answer.isCorrect
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                            onClick={() =>
                              handleUpdateAnswer(answer.id, {
                                isCorrect: !answer.isCorrect,
                              })
                            }
                          >
                            {answer.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Input
                            value={answer.answer}
                            onChange={(e) =>
                              handleUpdateAnswer(answer.id, {
                                answer: e.target.value,
                              })
                            }
                            onBlur={(e) =>
                              handleUpdateAnswer(answer.id, {
                                answer: e.target.value,
                              })
                            }
                            className="flex-1 h-8 text-sm"
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-6 w-6 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Answer?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this answer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Answer */}
                <div className="pt-4 border-t">
                  <Label className="text-sm mb-2 block">Add New Answer</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAnswerText}
                      onChange={(e) => setNewAnswerText(e.target.value)}
                      placeholder="Enter answer text..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newAnswerText.trim()) {
                          handleAddAnswer();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleAddAnswer}
                      disabled={!newAnswerText.trim() || isAddingAnswer}
                    >
                      {isAddingAnswer ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the circle icon to mark an answer as correct
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
