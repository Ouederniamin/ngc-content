"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [codeType, setCodeType] = useState("html");
  const [numExercises, setNumExercises] = useState("3");
  const [moduleId, setModuleId] = useState(searchParams.get("moduleId") || "");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available modules
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/modules");
        if (response.ok) {
          const data = await response.json();
          setModules(data);
        }
      } catch (err) {
        console.error("Failed to fetch modules");
      }
    };
    fetchModules();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for the lesson");
      return;
    }

    if (!moduleId) {
      setError("Please select a module for this lesson");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    const prompt = `Create a lesson about: ${topic}

Code Type: ${codeType}
Number of Exercises: ${numExercises}
${additionalInfo ? `Additional Requirements: ${additionalInfo}` : ""}

Please generate a complete lesson with:
- A clear, engaging title
- Theory content explaining the concept (HTML format)
- ${numExercises} hands-on coding exercises
- Each exercise should have 2-4 step-by-step instructions
- Include correct code answers for validation
- Provide starter code where appropriate`;

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson",
          prompt,
          moduleId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to generate lesson. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Lesson
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a lesson with theory and exercises using AI
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Lesson Details</CardTitle>
              <CardDescription>
                Provide information about the lesson you want to create
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="module">Module *</Label>
            <select
              id="module"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Select a module...</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
            {modules.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No modules found. Create a SkillPath first to add modules.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Lesson Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Introduction to HTML Forms"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="codeType">Code Type</Label>
              <select
                id="codeType"
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="html-css">HTML + CSS</option>
                <option value="html-js">HTML + JavaScript</option>
                <option value="html-css-js">HTML + CSS + JavaScript</option>
                <option value="javascript">JavaScript Only</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercises">Number of Exercises</Label>
              <select
                id="exercises"
                value={numExercises}
                onChange={(e) => setNumExercises(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="2">2 Exercises</option>
                <option value="3">3 Exercises</option>
                <option value="4">4 Exercises</option>
                <option value="5">5 Exercises</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Additional Requirements (Optional)</Label>
            <Textarea
              id="additional"
              placeholder="Any specific concepts to cover, difficulty level, or examples to include..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-12"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Lesson...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Lesson with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Lesson Created Successfully!
                </CardTitle>
                <CardDescription>
                  Your new lesson has been saved to the database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {result.content?.title || result.raw?.title}
              </h3>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Exercises Created:
              </h4>
              {(result.content?.exercises || result.raw?.exercises)?.map(
                (exercise: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Exercise {index + 1}: {exercise.title}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Code Type: {exercise.codeType} •{" "}
                      {exercise.instructions?.length || 0} instructions
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setResult(null);
                  setTopic("");
                  setAdditionalInfo("");
                }}
                variant="outline"
              >
                Create Another
              </Button>
              <Link href="/dashboard/lessons">
                <Button>View All Lessons</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
