"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function CreateSkillPathPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("beginners");
  const [numUnits, setNumUnits] = useState("4");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for the SkillPath");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    const prompt = `Create a SkillPath about: ${topic}

Target Audience: ${targetAudience}
Number of Units: ${numUnits}
${additionalInfo ? `Additional Requirements: ${additionalInfo}` : ""}

Please generate a complete learning path with:
- A compelling title and description
- ${numUnits} units covering different aspects of the topic
- 3-5 modules per unit with clear learning objectives
- Logical progression from basics to advanced concepts`;

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skillpath",
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to generate SkillPath. Please try again.");
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
            Create SkillPath
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a complete learning path with AI
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>SkillPath Details</CardTitle>
              <CardDescription>
                Provide information about the learning path you want to create
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Web Development with HTML, CSS and JavaScript"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              What should learners be able to do after completing this
              SkillPath?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <select
                id="audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="complete beginners">Complete Beginners</option>
                <option value="beginners">Beginners with some knowledge</option>
                <option value="intermediate">Intermediate learners</option>
                <option value="advanced">Advanced learners</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Number of Units</Label>
              <select
                id="units"
                value={numUnits}
                onChange={(e) => setNumUnits(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="2">2 Units</option>
                <option value="3">3 Units</option>
                <option value="4">4 Units</option>
                <option value="5">5 Units</option>
                <option value="6">6 Units</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Additional Requirements (Optional)</Label>
            <Textarea
              id="additional"
              placeholder="Any specific topics to cover, technologies to include, or learning objectives..."
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
                Generating SkillPath...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate SkillPath with AI
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
                  SkillPath Created Successfully!
                </CardTitle>
                <CardDescription>
                  Your new SkillPath has been saved to the database
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
                Units Created:
              </h4>
              {(result.content?.units || result.raw?.units)?.map(
                (unit: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Unit {index + 1}: {unit.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {unit.description}
                    </p>
                    {unit.modules && (
                      <div className="mt-3 space-y-1">
                        {unit.modules.map((module: any, mIndex: number) => (
                          <div
                            key={mIndex}
                            className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            {module.title}
                          </div>
                        ))}
                      </div>
                    )}
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
              <Link href="/dashboard/skillpaths">
                <Button>View All SkillPaths</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
