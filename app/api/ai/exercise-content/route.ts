import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_ENDPOINT?.replace("https://", "").replace(".openai.azure.com", "") || "",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
  useDeploymentBasedUrls: true,
});

const STYLE_PROMPTS: Record<string, string> = {
  starter: `Generate STARTER CODE with:
- Basic boilerplate and structure
- Clear TODO comments where students need to write code
- Helpful comments explaining what each section should do
- The code should run but be incomplete`,

  complete: `Generate a COMPLETE SOLUTION with:
- Fully working, production-quality code
- Best practices and clean code principles
- Helpful comments explaining the implementation
- Proper error handling where applicable`,

  partial: `Generate PARTIALLY IMPLEMENTED CODE with:
- Some functions/sections fully implemented
- Other parts left for students to complete
- Mix of working code and TODO sections
- Comments indicating what's done vs what needs work`,

  skeleton: `Generate a CODE SKELETON with:
- Function signatures and class structures only
- Type definitions and interfaces (if applicable)
- No implementation details
- JSDoc/docstring comments describing expected behavior`,

  buggy: `Generate BUGGY CODE with:
- Code that looks correct but has intentional bugs
- Include 2-3 subtle bugs for students to find and fix
- Add a comment at the top mentioning there are bugs to fix
- The bugs should be realistic mistakes developers make`,
};

const CODE_TYPE_CONTEXT: Record<string, string> = {
  html: "HTML5 with semantic elements and proper structure",
  css: "Modern CSS with flexbox/grid, custom properties, and responsive design",
  javascript: "Modern JavaScript (ES6+) with best practices",
  typescript: "TypeScript with proper types and interfaces",
  python: "Python 3 with type hints and PEP 8 style",
  react: "React with functional components and hooks",
  nextjs: "Next.js App Router with Server/Client components",
  nodejs: "Node.js with ES modules and async/await",
};

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, codeType, style, customPrompt } = await request.json();

    if (!exerciseId || !codeType || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch exercise with full context
    const exercise = await prisma.lessonExercise.findFirst({
      where: {
        id: exerciseId,
        lesson: {
          module: {
            unit: {
              skillPath: {
                creatorId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                unit: {
                  include: {
                    skillPath: true,
                  },
                },
              },
            },
            scrimbaScripts: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
        instructions: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build context for AI
    const exerciseContext = `
SKILL PATH: ${exercise.lesson.module.unit.skillPath.title}
UNIT: ${exercise.lesson.module.unit.title}
MODULE: ${exercise.lesson.module.title}
LESSON: ${exercise.lesson.title}
EXERCISE: ${exercise.title}
${exercise.description ? `DESCRIPTION: ${exercise.description}` : ""}

INSTRUCTIONS FOR THIS EXERCISE:
${exercise.instructions.map((inst, i) => `${i + 1}. ${inst.title}${inst.body ? `\n   Details: ${inst.body}` : ""}`).join("\n")}

${exercise.lesson.scrimbaScripts[0] ? `
LESSON THEORY CONTEXT (from Scrimba Script):
${exercise.lesson.scrimbaScripts[0].content.substring(0, 1000)}...
` : ""}
`;

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.starter;
    const codeContext = CODE_TYPE_CONTEXT[codeType] || codeType;

    const prompt = `You are an expert coding instructor creating exercise content for NextGen Coding, an educational platform.

CODE TYPE: ${codeContext}

${stylePrompt}

EXERCISE CONTEXT:
${exerciseContext}

${customPrompt ? `ADDITIONAL REQUIREMENTS:\n${customPrompt}\n` : ""}

Generate the exercise content as RICH HTML compatible with the Tiptap editor. The content should be educational, clear, and well-structured.

TIPTAP HTML FORMAT REQUIREMENTS (MUST FOLLOW EXACTLY):

1. PARAGRAPHS: Use <p> tags for all text paragraphs
   Example: <p>This is a paragraph of explanatory text.</p>

2. HEADINGS: Use <h3> for section headings (never h1 or h2)
   Example: <h3>Getting Started</h3>

3. CODE BLOCKS: Use <pre><code class="language-${codeType}">...</code></pre> for multi-line code
   - ALWAYS include the language class (language-javascript, language-python, etc.)
   - Escape HTML entities in code: < as &lt;, > as &gt;, & as &amp;
   Example: <pre><code class="language-${codeType}">const greeting = "Hello";\nconsole.log(greeting);</code></pre>

4. INLINE CODE: Use <code>variableName</code> or <code data-code-style="code-blue">variableName</code> for inline code references
   Available data-code-style values: code-pink, code-blue, code-green, code-purple, code-orange, code-gray
   Example: <p>Use the <code>console.log()</code> function to print output.</p>
   Example with style: <p>The <code data-code-style="code-blue">useState</code> hook manages state.</p>

5. BOLD TEXT: Use <strong>text</strong> for emphasis
   Example: <p><strong>Important:</strong> Always validate user input.</p>

6. ITALIC TEXT: Use <em>text</em> for emphasis
   Example: <p>This is <em>especially</em> important.</p>

7. HIGHLIGHTED TEXT: Use <mark data-color="highlight-yellow">text</mark> for highlights
   Available data-color values: highlight-yellow, highlight-green, highlight-blue, highlight-purple, highlight-pink, highlight-orange, highlight-red, highlight-cyan
   Example: <p>Remember to <mark data-color="highlight-green">save your work</mark> frequently.</p>

8. LISTS: Use <ul><li>item</li></ul> for bullet lists, <ol><li>item</li></ol> for numbered
   Example: <ul><li>First point</li><li>Second point</li></ul>

9. BLOCKQUOTES: Use <blockquote><p>text</p></blockquote> for notes/tips
   Example: <blockquote><p>Pro tip: Use descriptive variable names.</p></blockquote>

CONTENT STRUCTURE:
1. Start with a brief introduction paragraph
2. Include a code block with the main exercise code
3. Add explanatory text about what the code does
4. Include key learning points as a list
5. End with a helpful tip or note in a blockquote

Return ONLY valid HTML. No markdown, no explanations outside HTML tags.
Start directly with <p> or <h3>.`;

    console.log("Generating exercise content for:", exercise.title);
    console.log("Code type:", codeType, "Style:", style);

    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini");

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 2000,
    });

    console.log("Generated content length:", text?.length || 0);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "AI generated empty content. Please try again." },
        { status: 500 }
      );
    }

    // Clean up any markdown code fences that might have been added
    let cleanedContent = text.trim();
    
    // Remove markdown code fences if present
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }
    
    // Remove html wrapper if AI added it
    if (cleanedContent.toLowerCase().startsWith("```html")) {
      cleanedContent = cleanedContent.replace(/^```html\n?/i, "").replace(/\n?```$/, "");
    }
    
    // Ensure the content starts with a valid HTML tag
    if (!cleanedContent.match(/^<(p|h[1-6]|ul|ol|pre|blockquote|div)/i)) {
      cleanedContent = `<p>${cleanedContent}</p>`;
    }

    return NextResponse.json({
      success: true,
      content: cleanedContent,
      exerciseId: exercise.id,
    });
  } catch (error) {
    console.error("Error generating exercise content:", error);
    return NextResponse.json(
      { error: "Failed to generate exercise content" },
      { status: 500 }
    );
  }
}
