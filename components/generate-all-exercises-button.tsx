"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: number;
  title: string;
  codeType: string;
}

interface GenerateAllExercisesButtonProps {
  lessonId: number;
  exercises: Exercise[];
}

export function GenerateAllExercisesButton({ lessonId, exercises }: GenerateAllExercisesButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentTitle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    if (exercises.length === 0) {
      setError("No exercises to generate content for");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCompleted(false);
    setProgress({ current: 0, total: exercises.length, currentTitle: "" });

    try {
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        setProgress({ current: i + 1, total: exercises.length, currentTitle: exercise.title });

        // Generate exercise content
        const contentResponse = await fetch("/api/ai/exercise-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            codeType: exercise.codeType || "javascript",
            style: "starter",
          }),
        });

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          
          // Save the generated content
          await fetch(`/api/exercises/${exercise.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: contentData.content,
            }),
          });
        }

        // Generate instruction answers
        await fetch("/api/ai/generate-all-answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            codeType: exercise.codeType || "javascript",
          }),
        });
      }

      setCompleted(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleGenerate}
        disabled={isGenerating || exercises.length === 0}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : completed ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Done!
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate All Content
          </>
        )}
      </Button>
      {progress && isGenerating && (
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {progress.current} of {progress.total}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
            {progress.currentTitle}
          </p>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
