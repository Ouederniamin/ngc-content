import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Code2,
  Languages,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Brain,
  Layers,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NGC Content
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Content Creation
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Create Educational Content{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                10x Faster
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Build complete learning paths, lessons, quizzes, and coding
              projects for NextGen Coding with the power of AI. Multi-language
              support included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  NGC Content Creator
                </span>
              </div>
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Brain className="w-5 h-5 text-violet-600" />
                    <span>AI Prompt</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-gray-700 dark:text-gray-300">
                    <p>
                      &quot;Create a beginner-friendly lesson about HTML forms with 3
                      exercises covering input types, form validation, and
                      submit handling&quot;
                    </p>
                  </div>
                  <Button className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Code2 className="w-5 h-5 text-green-600" />
                    <span>Generated Output</span>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-hidden">
                    <pre className="whitespace-pre-wrap">{`{
  "title": "HTML Forms Mastery",
  "exercises": [
    {
      "title": "Text Input Basics",
      "codeType": "html",
      "instructions": [...]
    }
  ]
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Create Amazing Content
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for educational content
              creation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Complete Content Hierarchy
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate SkillPaths with Units, Modules, Lessons, Quizzes, and
                Projects—all structured for optimal learning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Multi-Language Code Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create exercises for HTML, CSS, JavaScript, and Python with
                validated code answers and starter templates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Multi-Language Translation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically translate content to English, French, and Tunisian
                Arabic with AI-powered localization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Instant Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create complete lessons with exercises in seconds, not hours.
                10x your content production speed.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quiz & Assessment Builder
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate multiple-choice quizzes with explanations,
                automatically structured for maximum retention.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Validated Code Answers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI generates correct code solutions that are automatically
                validated against user submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create Any Content Type
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From simple lessons to complex capstone projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lesson Card */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">📚 Lessons</h3>
              <p className="text-violet-100 mb-6">
                Theory content + hands-on coding exercises with step-by-step
                instructions and validated answers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-200" />
                  <span>Rich theory content (HTML)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-200" />
                  <span>Multiple exercises per lesson</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-200" />
                  <span>Step-by-step instructions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-200" />
                  <span>Code validation answers</span>
                </li>
              </ul>
            </div>

            {/* Quiz Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">❓ Quizzes</h3>
              <p className="text-blue-100 mb-6">
                Multiple-choice assessments to test knowledge retention with
                detailed explanations.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span>5-10 questions per quiz</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span>4 answer options each</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span>Detailed explanations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span>Progressive difficulty</span>
                </li>
              </ul>
            </div>

            {/* Project Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🚀 Projects</h3>
              <p className="text-green-100 mb-6">
                Capstone projects with multiple tasks that apply learned
                concepts in real-world scenarios.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-200" />
                  <span>3-6 tasks per project</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-200" />
                  <span>Starter code templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-200" />
                  <span>Real-world applications</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-200" />
                  <span>Complete solutions</span>
                </li>
              </ul>
            </div>

            {/* SkillPath Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🎯 SkillPaths</h3>
              <p className="text-orange-100 mb-6">
                Complete learning journeys with units and modules organized for
                progressive skill building.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-200" />
                  <span>Multiple units per path</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-200" />
                  <span>Modules per unit</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-200" />
                  <span>Logical progression</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-200" />
                  <span>XP and gamification ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Content Creation?
            </h2>
            <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
              Join NextGen Coding and start creating engaging educational
              content with the power of AI.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-violet-600 hover:bg-gray-100"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                NGC Content
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 NextGen Coding. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
