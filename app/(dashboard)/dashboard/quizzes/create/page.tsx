"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function CreateQuizPage() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [moduleId, setModuleId] = useState(searchParams.get("moduleId") || "");
  const [difficulty, setDifficulty] = useState("mixed");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
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
      setError("Please enter a topic for the quiz");
      return;
    }

    if (!moduleId) {
      setError("Please select a module for this quiz");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    const prompt = `Create a quiz about: ${topic}

Number of Questions: ${numQuestions}
Difficulty: ${difficulty}
${additionalInfo ? `Additional Requirements: ${additionalInfo}` : ""}

Please generate a multiple-choice quiz with:
- A clear, engaging title
- A brief description
- ${numQuestions} questions testing understanding of the topic
- 4 answer options per question (only one correct)
- Detailed explanations for why the correct answer is right
- Progressive difficulty from easier to harder`;

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
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
      setError("Failed to generate quiz. Please try again.");
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
            Create Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a multiple-choice quiz using AI
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>
                Provide information about the quiz you want to create
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Quiz Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., HTML Elements and Attributes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <select
                id="questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="5">5 Questions</option>
                <option value="7">7 Questions</option>
                <option value="10">10 Questions</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="easy">Easy</option>
                <option value="mixed">Mixed (Progressive)</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Additional Requirements (Optional)</Label>
            <Textarea
              id="additional"
              placeholder="Any specific topics to focus on or question types to include..."
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
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Quiz with AI
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
                  Quiz Created Successfully!
                </CardTitle>
                <CardDescription>
                  Your new quiz has been saved to the database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {result.content?.title || result.raw?.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {result.content?.description || result.raw?.description}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Questions Created: {(result.content?.questions || result.raw?.questions)?.length || 0}
              </h4>
              {(result.content?.questions || result.raw?.questions)?.slice(0, 3).map(
                (question: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      Q{index + 1}: {question.question}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {question.answers?.length || 4} answer options
                    </p>
                  </div>
                )
              )}
              {(result.content?.questions || result.raw?.questions)?.length > 3 && (
                <p className="text-sm text-gray-500">
                  + {(result.content?.questions || result.raw?.questions).length - 3} more questions
                </p>
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
              <Link href="/dashboard/quizzes">
                <Button>View All Quizzes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
