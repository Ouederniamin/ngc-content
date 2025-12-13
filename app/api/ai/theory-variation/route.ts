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
  standard: `Write a clear, balanced theory explanation that is suitable for general learners. 
Use straightforward language, provide context, and include relevant examples. 
Structure the content with clear headings and paragraphs.`,

  simplified: `Write a beginner-friendly theory explanation using simple language and relatable analogies. 
Avoid jargon, break down complex concepts into smaller pieces, and use everyday examples.
Assume the reader has no prior knowledge of programming.`,

  technical: `Write an in-depth technical explanation for advanced learners.
Include detailed information about how things work under the hood, performance considerations,
best practices, and edge cases. Use proper technical terminology.`,

  storytelling: `Write the theory as an engaging story or narrative.
Use real-world scenarios, character examples, or a journey metaphor to explain the concepts.
Make it memorable and relatable while ensuring the technical accuracy.`,

  visual: `Write theory content that emphasizes visual learning.
Include plenty of code examples with detailed comments, describe visual diagrams,
use bullet points and numbered lists, and format code snippets clearly.
Describe step-by-step what happens visually when code runs.`,

  interactive: `Write theory content designed for interactive learning.
Include thought-provoking questions, mini-challenges, and encourage experimentation.
Break content into digestible chunks with clear action items.`,
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

    const { lessonId, style, title } = await request.json();

    if (!lessonId || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the lesson belongs to the user
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          unit: {
            skillPath: {
              creatorId: session.user.id,
            },
          },
        },
      },
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
        exercises: {
          orderBy: { position: "asc" },
          include: {
            instructions: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build context for AI
    const lessonContext = `
SkillPath: ${lesson.module.unit.skillPath.title}
Unit: ${lesson.module.unit.title}
Module: ${lesson.module.title}
Lesson: ${lesson.title}
${lesson.description ? `Description: ${lesson.description}` : ""}

Exercises in this lesson:
${lesson.exercises.map((ex, i) => `${i + 1}. ${ex.title} (${ex.codeType})
   Instructions: ${ex.instructions.map(inst => inst.title).join(", ")}`).join("\n")}
`;

    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.standard;

    const prompt = `You are an expert educational content creator for a coding education platform called NextGen Coding.

${stylePrompt}

Create a Scrimba Script (theory content) for the following lesson:

${lessonContext}

Requirements:
1. Write comprehensive theory content that prepares students for the lesson exercises
2. Explain the concepts they need to understand before attempting the exercises
3. Make sure the content is directly relevant to what the lesson teaches
4. Include at least 2-3 code examples if applicable
5. The content should be between 800-1500 words
6. Structure it like a Scrimba screencast script - engaging, conversational, and educational

TIPTAP HTML FORMAT REQUIREMENTS (MUST FOLLOW EXACTLY):

1. PARAGRAPHS: Use <p> tags for all text paragraphs
   Example: <p>This is a paragraph of explanatory text.</p>

2. HEADINGS: Use <h2> for main sections, <h3> for subsections
   Example: <h2>Understanding Variables</h2>

3. CODE BLOCKS: Use <pre><code class="language-javascript">...</code></pre> for multi-line code
   - ALWAYS include the language class (language-javascript, language-python, etc.)
   - Escape HTML entities in code: < as &lt;, > as &gt;, & as &amp;
   Example: <pre><code class="language-javascript">const greeting = "Hello";\nconsole.log(greeting);</code></pre>

4. INLINE CODE: Use <code>variableName</code> for inline code references
   Example: <p>Use the <code>console.log()</code> function to print output.</p>

5. BOLD TEXT: Use <strong>text</strong> for emphasis
   Example: <p><strong>Important:</strong> Always validate user input.</p>

6. ITALIC TEXT: Use <em>text</em> for emphasis
   Example: <p>This is <em>especially</em> important.</p>

7. HIGHLIGHTED TEXT: Use <mark data-color="highlight-yellow">text</mark> for key concepts
   Available data-color values: highlight-yellow, highlight-green, highlight-blue, highlight-purple, highlight-pink
   Example: <p>The <mark data-color="highlight-yellow">return statement</mark> is essential.</p>

8. LISTS: Use <ul><li>item</li></ul> for bullet lists, <ol><li>item</li></ol> for numbered
   Example: <ul><li>First point</li><li>Second point</li></ul>

9. BLOCKQUOTES: Use <blockquote><p>text</p></blockquote> for notes/tips
   Example: <blockquote><p>Pro tip: Use descriptive variable names.</p></blockquote>

Return ONLY valid HTML. No markdown, no code fences wrapping the response.
Start directly with <h2> or <p>.`;

    const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini");

    console.log("Generating scrimba script with model:", process.env.AZURE_OPENAI_DEPLOYMENT);
    console.log("Prompt length:", prompt.length);

    const { text } = await generateText({
      model,
      prompt,
      maxOutputTokens: 3000,
    });

    console.log("Generated text length:", text?.length || 0);
    console.log("Generated text preview:", text?.substring(0, 200));

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "AI generated empty content. Please try again." },
        { status: 500 }
      );
    }

    // Get the current count of scripts for variation numbering
    const existingCount = await prisma.scrimbaScript.count({
      where: { lessonId },
    });

    // Save the generated script
    const script = await prisma.scrimbaScript.create({
      data: {
        title: title || (STYLE_PROMPTS[style] ? style.charAt(0).toUpperCase() + style.slice(1) : "Script Variation"),
        content: text.trim(),
        style: style,
        isActive: existingCount === 0, // First script is active by default
        variationNumber: existingCount + 1,
        lessonId: lessonId,
      },
    });

    return NextResponse.json({
      success: true,
      script: {
        id: script.id,
        title: script.title,
        style: script.style,
        variationNumber: script.variationNumber,
      },
    });
  } catch (error) {
    console.error("Error generating scrimba script:", error);
    return NextResponse.json(
      { error: "Failed to generate scrimba script" },
      { status: 500 }
    );
  }
}
