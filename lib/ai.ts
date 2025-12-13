import { createAzure } from "@ai-sdk/azure";

// Extract resource name from endpoint URL if provided
const resourceName = process.env.AZURE_OPENAI_ENDPOINT
  ? new URL(process.env.AZURE_OPENAI_ENDPOINT).hostname.split(".")[0]
  : "nextgen-east-us2";

export const azure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  resourceName,
  // Use deployment-based URLs (required for Global Standard deployments)
  useDeploymentBasedUrls: true,
  // Use a supported API version
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
});

export const model = azure(process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5-mini");

// Content generation prompts
const TIPTAP_FORMAT_INSTRUCTIONS = `

TIPTAP HTML FORMAT REQUIREMENTS (MUST FOLLOW EXACTLY):

1. PARAGRAPHS: Use <p> tags for all text paragraphs
   Example: <p>This is a paragraph of explanatory text.</p>

2. HEADINGS: Use <h2> for main sections, <h3> for subsections
   Example: <h2>Understanding Variables</h2>

3. CODE BLOCKS: Use <pre><code class="language-javascript">...</code></pre> for multi-line code
   - ALWAYS include the language class (language-javascript, language-python, etc.)
   - Escape HTML entities in code: < as &lt;, > as &gt;, & as &amp;
   Example: <pre><code class="language-javascript">const greeting = "Hello";</code></pre>

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

Return ONLY valid HTML. No markdown, no code fences wrapping the response.`;

export const SYSTEM_PROMPTS = {
  skillPath: `You are an expert educational content creator for NextGen Coding, a gamified programming education platform.
Your task is to generate a complete SkillPath structure with units and modules.

Guidelines:
- Create engaging, progressive learning content
- Each unit should have a clear theme
- Modules should build on each other logically
- Support multiple programming languages: HTML, CSS, JavaScript, Python
- Content should be suitable for beginners to intermediate learners
- Include practical, hands-on exercises

Output format: JSON with title, description, and array of units (each with modules).`,

  lesson: `You are an expert educational content creator for NextGen Coding.
Your task is to generate a complete Lesson with exercises.

Guidelines:
- Create a clear, concise description of what the lesson covers
- Include 2-4 exercises that progressively increase in difficulty
- Each exercise should have step-by-step instructions
- Provide correct code answers for validation
- Keep instructions clear and actionable
- Theory content (Scrimba Scripts) will be generated separately

Output format: JSON with title, description, and exercises array.`,

  quiz: `You are an expert educational content creator for NextGen Coding.
Your task is to generate a Quiz with multiple-choice questions.

Guidelines:
- Create 5-10 questions per quiz
- Each question should have 4 answer options
- Only one answer should be correct
- Include explanations for why the answer is correct
- Questions should test understanding, not just memorization
- Progress from easier to harder questions

Output format: JSON with title, description, and questions array.`,

  project: `You are an expert educational content creator for NextGen Coding.
Your task is to generate a capstone Project with multiple tasks.

Guidelines:
- Create a cohesive project that applies learned concepts
- Break down into 3-6 manageable tasks
- Each task should have clear instructions and expected code
- Include starter code where appropriate
- Tasks should build on each other
- Final result should be a complete, working project
- The notionContent field MUST be valid Tiptap HTML for the project brief

${TIPTAP_FORMAT_INSTRUCTIONS}

Output format: JSON with title, description, notionContent (in Tiptap HTML format), and tasks array.`,

  translate: `You are a professional translator specializing in educational content.
Translate the provided content while:
- Maintaining technical accuracy
- Keeping code snippets unchanged
- Preserving formatting and structure
- Adapting cultural references appropriately
- Using appropriate educational tone for the target language

Target languages:
- French (fr): Standard French
- Tunisian Arabic (tn): Tunisian dialect, written in Arabic script or Latin transliteration as appropriate`,
};
