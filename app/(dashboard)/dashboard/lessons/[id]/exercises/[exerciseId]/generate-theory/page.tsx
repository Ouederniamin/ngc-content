"use client";

import { useState, use } from "react";
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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Loader2, BookOpen, Lightbulb, Code2, Palette } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; exerciseId: string }>;
}

const VARIATION_STYLES = [
  {
    id: "standard",
    name: "Standard",
    description: "Clear and balanced explanation for general learners",
    icon: BookOpen,
    color: "blue",
  },
  {
    id: "simplified",
    name: "Simplified",
    description: "Beginner-friendly with simple language and analogies",
    icon: Lightbulb,
    color: "green",
  },
  {
    id: "technical",
    name: "Technical Deep Dive",
    description: "In-depth technical explanation with advanced concepts",
    icon: Code2,
    color: "purple",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Engaging narrative format with real-world examples",
    icon: Palette,
    color: "orange",
  },
  {
    id: "visual",
    name: "Visual Learner",
    description: "Emphasizes diagrams, code examples, and visual aids",
    icon: Palette,
    color: "pink",
  },
];

export default function GenerateTheoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string>("standard");
  const [customTitle, setCustomTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/theory-variation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId: parseInt(resolvedParams.exerciseId),
          lessonId: parseInt(resolvedParams.id),
          style: selectedStyle,
          title: customTitle || VARIATION_STYLES.find(s => s.id === selectedStyle)?.name || "Variation",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate theory variation");
      }

      router.push(`/dashboard/lessons/${resolvedParams.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link
          href={`/dashboard/lessons/${resolvedParams.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lesson
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate Theory Variation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create AI-generated theory content variations for different learning styles
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Variation Style</CardTitle>
          <CardDescription>
            Choose a style that matches how you want the theory content to be explained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            {VARIATION_STYLES.map((style) => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              const colorClasses: Record<string, string> = {
                blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                green: "border-green-500 bg-green-50 dark:bg-green-900/20",
                purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
                orange: "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
                pink: "border-pink-500 bg-pink-50 dark:bg-pink-900/20",
              };
              const iconColorClasses: Record<string, string> = {
                blue: "text-blue-600 dark:text-blue-400",
                green: "text-green-600 dark:text-green-400",
                purple: "text-purple-600 dark:text-purple-400",
                orange: "text-orange-600 dark:text-orange-400",
                pink: "text-pink-600 dark:text-pink-400",
              };

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? colorClasses[style.color]
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? "" : "bg-gray-100 dark:bg-gray-800"}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? iconColorClasses[style.color] : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {style.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {style.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-current bg-current" : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customTitle">Custom Title (Optional)</Label>
            <input
              id="customTitle"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={VARIATION_STYLES.find(s => s.id === selectedStyle)?.name || "Variation"}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Give this variation a custom name to help identify it later
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Theory Variation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
