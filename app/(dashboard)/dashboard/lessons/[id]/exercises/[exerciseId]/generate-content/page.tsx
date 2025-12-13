"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Code,
  FileCode,
  Braces,
  FileJson,
  Terminal,
  Globe,
  Palette,
  Check,
  RefreshCw,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; exerciseId: string }>;
}

interface ExerciseData {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  codeType: string;
  lesson: {
    title: string;
    module: {
      title: string;
      unit: {
        title: string;
        skillPath: {
          title: string;
        };
      };
    };
  };
  instructions: Array<{
    id: number;
    title: string;
    body: string | null;
  }>;
}

const CODE_TYPES = [
  { id: "html", name: "HTML", icon: Globe, color: "orange" },
  { id: "css", name: "CSS", icon: Palette, color: "blue" },
  { id: "javascript", name: "JavaScript", icon: Braces, color: "yellow" },
  { id: "typescript", name: "TypeScript", icon: FileCode, color: "blue" },
  { id: "python", name: "Python", icon: Terminal, color: "green" },
  { id: "react", name: "React/JSX", icon: Code, color: "cyan" },
  { id: "nextjs", name: "Next.js", icon: FileJson, color: "white" },
  { id: "nodejs", name: "Node.js", icon: Terminal, color: "green" },
];

const CONTENT_STYLES = [
  {
    id: "starter",
    name: "Starter Code",
    description: "Basic boilerplate with TODO comments for students to complete",
  },
  {
    id: "complete",
    name: "Complete Solution",
    description: "Full working solution that students can reference",
  },
  {
    id: "partial",
    name: "Partial Implementation",
    description: "Some code is written, some parts need to be filled in",
  },
  {
    id: "skeleton",
    name: "Code Skeleton",
    description: "Function signatures and structure only, no implementation",
  },
  {
    id: "buggy",
    name: "Buggy Code",
    description: "Code with intentional bugs for students to fix",
  },
];

export default function GenerateExerciseContentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCodeType, setSelectedCodeType] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("starter");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const response = await fetch(`/api/exercises/${resolvedParams.exerciseId}`);
        if (response.ok) {
          const data = await response.json();
          setExercise(data);
          setSelectedCodeType(data.codeType?.toLowerCase() || "javascript");
          if (data.content) {
            setGeneratedContent(data.content);
          }
        }
      } catch (err) {
        console.error("Failed to fetch exercise:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchExercise();
  }, [resolvedParams.exerciseId]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/exercise-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId: parseInt(resolvedParams.exerciseId),
          codeType: selectedCodeType,
          style: selectedStyle,
          customPrompt: customPrompt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate exercise content");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedContent) return;

    try {
      const response = await fetch(`/api/exercises/${resolvedParams.exerciseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: generatedContent,
          codeType: selectedCodeType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      router.push(`/dashboard/lessons/${resolvedParams.id}/exercises/${resolvedParams.exerciseId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/dashboard/lessons/${resolvedParams.id}/exercises/${resolvedParams.exerciseId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exercise
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate Exercise Content
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create AI-generated code content for &quot;{exercise.title}&quot;
          </p>
        </div>
      </div>

      {/* Exercise Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exercise Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Path:</span>
              <span className="text-gray-900 dark:text-white">
                {exercise.lesson.module.unit.skillPath.title} → {exercise.lesson.module.unit.title} → {exercise.lesson.module.title} → {exercise.lesson.title}
              </span>
            </div>
            {exercise.description && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Description:</span>
                <p className="text-gray-900 dark:text-white mt-1">{exercise.description}</p>
              </div>
            )}
            {exercise.instructions.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Instructions ({exercise.instructions.length}):</span>
                <ul className="mt-2 space-y-1">
                  {exercise.instructions.slice(0, 5).map((inst, i) => (
                    <li key={inst.id} className="text-gray-700 dark:text-gray-300">
                      {i + 1}. {inst.title}
                    </li>
                  ))}
                  {exercise.instructions.length > 5 && (
                    <li className="text-gray-500">...and {exercise.instructions.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Code Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Code Type</CardTitle>
          <CardDescription>
            Select the programming language or technology for this exercise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CODE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedCodeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedCodeType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-gray-500"}`} />
                    <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                      {type.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Content Style</CardTitle>
          <CardDescription>
            Choose how the generated code should be structured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {CONTENT_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isSelected ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                        {style.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {style.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Instructions (Optional)</CardTitle>
          <CardDescription>
            Provide any specific requirements or context for the generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Include a function called 'calculateTotal' that accepts an array of numbers..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Exercise Content
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-center">
          {error}
        </div>
      )}

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review and save the generated exercise content
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Badge className="absolute top-3 right-3 z-10">
                {CODE_TYPES.find(t => t.id === selectedCodeType)?.name || selectedCodeType}
              </Badge>
              <div className="p-4 bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 overflow-x-auto">
                <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
                  {generatedContent}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
