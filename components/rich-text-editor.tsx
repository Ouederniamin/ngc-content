"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Code from "@tiptap/extension-code";
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code as CodeIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  FileCode,
  Highlighter,
  ChevronDown,
  Palette,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";

const lowlight = createLowlight(common);

// Highlight colors with CSS variable names for dark/light mode support
const HIGHLIGHT_COLORS = [
  { name: "Yellow", cssVar: "highlight-yellow", lightColor: "#fef08a", darkColor: "#713f12" },
  { name: "Green", cssVar: "highlight-green", lightColor: "#bbf7d0", darkColor: "#14532d" },
  { name: "Blue", cssVar: "highlight-blue", lightColor: "#bfdbfe", darkColor: "#1e3a5f" },
  { name: "Purple", cssVar: "highlight-purple", lightColor: "#e9d5ff", darkColor: "#4c1d95" },
  { name: "Pink", cssVar: "highlight-pink", lightColor: "#fbcfe8", darkColor: "#831843" },
  { name: "Orange", cssVar: "highlight-orange", lightColor: "#fed7aa", darkColor: "#7c2d12" },
  { name: "Red", cssVar: "highlight-red", lightColor: "#fecaca", darkColor: "#7f1d1d" },
  { name: "Cyan", cssVar: "highlight-cyan", lightColor: "#a5f3fc", darkColor: "#164e63" },
];

// Inline code styles
const CODE_STYLES = [
  { name: "Pink", cssVar: "code-pink", lightBg: "#fce7f3", lightText: "#be185d", darkBg: "#831843", darkText: "#fbcfe8" },
  { name: "Blue", cssVar: "code-blue", lightBg: "#dbeafe", lightText: "#1d4ed8", darkBg: "#1e3a8a", darkText: "#bfdbfe" },
  { name: "Green", cssVar: "code-green", lightBg: "#dcfce7", lightText: "#15803d", darkBg: "#14532d", darkText: "#bbf7d0" },
  { name: "Purple", cssVar: "code-purple", lightBg: "#f3e8ff", lightText: "#7c3aed", darkBg: "#4c1d95", darkText: "#e9d5ff" },
  { name: "Orange", cssVar: "code-orange", lightBg: "#ffedd5", lightText: "#c2410c", darkBg: "#7c2d12", darkText: "#fed7aa" },
  { name: "Gray", cssVar: "code-gray", lightBg: "#f3f4f6", lightText: "#374151", darkBg: "#374151", darkText: "#e5e7eb" },
];

// Supported languages with display names
const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "JS" },
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "python", label: "Python", icon: "PY" },
  { value: "html", label: "HTML", icon: "HTML" },
  { value: "css", label: "CSS", icon: "CSS" },
  { value: "jsx", label: "JSX", icon: "JSX" },
  { value: "tsx", label: "TSX", icon: "TSX" },
  { value: "json", label: "JSON", icon: "JSON" },
  { value: "bash", label: "Bash", icon: "SH" },
  { value: "sql", label: "SQL", icon: "SQL" },
  { value: "markdown", label: "Markdown", icon: "MD" },
  { value: "plaintext", label: "Plain Text", icon: "TXT" },
];

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false, // Disable default code, we use custom
      }),
      Placeholder.configure({
        placeholder,
      }),
      // Custom Code extension with style support
      Code.extend({
        addAttributes() {
          return {
            style: {
              default: null,
              parseHTML: element => element.getAttribute('data-code-style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  'data-code-style': attributes.style,
                };
              },
            },
          };
        },
      }),
      Highlight.configure({
        multicolor: true,
      }).extend({
        addAttributes() {
          return {
            color: {
              default: null,
              parseHTML: element => element.getAttribute('data-color'),
              renderHTML: attributes => {
                if (!attributes.color) {
                  return {};
                }
                return {
                  'data-color': attributes.color,
                };
              },
            },
          };
        },
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3",
          "prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white",
          "prose-p:text-gray-700 dark:prose-p:text-gray-300",
          "prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600",
          "prose-ul:list-disc prose-ol:list-decimal",
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-[200px]" />
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        isActive && "bg-gray-200 dark:bg-gray-700 text-primary"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("border rounded-lg bg-white dark:bg-gray-900", className)}>
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          
          {/* Inline Code Style Picker */}
          <InlineCodeStylePicker editor={editor} />
          
          {/* Highlight Color Picker */}
          <HighlightColorPicker editor={editor} />

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Code Block with Language Selector */}
          <CodeBlockDropdown editor={editor} />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

// Inline Code Style Picker Component
function InlineCodeStylePicker({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (!editor) return null;

  const applyCodeStyle = (styleVar: string | null) => {
    if (editor.isActive('code')) {
      // If already code, update the style
      if (styleVar) {
        editor.chain().focus().updateAttributes('code', { style: styleVar }).run();
      } else {
        editor.chain().focus().unsetCode().run();
      }
    } else {
      // Apply code with style
      editor.chain().focus().setCode().updateAttributes('code', { style: styleVar }).run();
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "flex items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
          editor.isActive("code") && "bg-gray-200 dark:bg-gray-700 text-primary"
        )}
        title="Inline Code Style"
      >
        <CodeIcon className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[140px]">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Code Style
          </div>
          <div className="space-y-1">
            {CODE_STYLES.map((item) => (
              <button
                key={item.name}
                onClick={() => applyCodeStyle(item.cssVar)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span 
                  className="px-2 py-0.5 rounded text-xs font-mono"
                  style={{ 
                    backgroundColor: isDark ? item.darkBg : item.lightBg,
                    color: isDark ? item.darkText : item.lightText
                  }}
                >
                  code
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
              </button>
            ))}
          </div>
          {editor.isActive('code') && (
            <button
              onClick={() => {
                editor.chain().focus().unsetCode().run();
                setShowMenu(false);
              }}
              className="w-full mt-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors border-t border-gray-200 dark:border-gray-700 pt-2"
            >
              Remove Code
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Highlight Color Picker Component
function HighlightColorPicker({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Watch for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (!editor) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "flex items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
          editor.isActive("highlight") && "bg-gray-200 dark:bg-gray-700 text-primary"
        )}
        title="Highlight Color"
      >
        <Highlighter className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
            Highlight Color
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {HIGHLIGHT_COLORS.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: item.cssVar }).run();
                  setShowMenu(false);
                }}
                className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: isDark ? item.darkColor : item.lightColor }}
                title={item.name}
              />
            ))}
          </div>
          <button
            onClick={() => {
              editor.chain().focus().unsetHighlight().run();
              setShowMenu(false);
            }}
            className="w-full mt-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Remove Highlight
          </button>
        </div>
      )}
    </div>
  );
}

// Code Block Dropdown Component
function CodeBlockDropdown({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showMenu, setShowMenu] = useState(false);

  if (!editor) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "flex items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
          editor.isActive("codeBlock") && "bg-gray-200 dark:bg-gray-700 text-primary"
        )}
        title="Insert Code Block"
      >
        <FileCode className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1 z-50 w-48 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-auto">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Select Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                editor.chain().focus().toggleCodeBlock({ language: lang.value }).run();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded w-10 text-center">
                {lang.icon}
              </span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Code Block component with copy functionality
function CodeBlockViewer({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  
  const langInfo = LANGUAGES.find(l => l.value === lang) || { 
    label: lang.toUpperCase(), 
    icon: lang.substring(0, 3).toUpperCase() 
  };
  
  // Decode HTML entities in the code
  const decodedCode = code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // Apply syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      const result = lowlight.highlight(lang, decodedCode);
      return toHtml(result);
    } catch {
      try {
        const result = lowlight.highlightAuto(decodedCode);
        return toHtml(result);
      } catch {
        return code;
      }
    }
  }, [lang, decodedCode, code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decodedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-container relative my-4 rounded-lg overflow-hidden not-prose">
      <div className="code-block-header flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="flex items-center gap-2 text-xs font-medium text-gray-300">
          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-gray-600 rounded">{langInfo.icon}</span>
          {langInfo.label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="m-0 p-4 bg-gray-900 overflow-x-auto">
        <code 
          className={`hljs language-${lang} text-sm leading-relaxed block`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}

// Read-only viewer component with enhanced code block rendering and syntax highlighting
export function RichTextViewer({ content, className }: { content: string; className?: string }) {
  // Parse content and extract code blocks to render them as React components
  const parts = useMemo(() => {
    if (!content) return [];
    
    const regex = /<pre><code class="language-(\w+)">([^]*?)<\/code><\/pre>/g;
    const result: Array<{ type: 'html' | 'code'; content: string; lang?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add HTML before this code block
      if (match.index > lastIndex) {
        result.push({ type: 'html', content: content.slice(lastIndex, match.index) });
      }
      // Add the code block
      result.push({ type: 'code', lang: match[1], content: match[2] });
      lastIndex = regex.lastIndex;
    }

    // Add remaining HTML after last code block
    if (lastIndex < content.length) {
      result.push({ type: 'html', content: content.slice(lastIndex) });
    }

    return result;
  }, [content]);

  return (
    <div
      className={cn(
        "rich-text-viewer prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white",
        "prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:my-2",
        "prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-500 dark:prose-code:text-pink-400",
        "prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-sm",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",
        "prose-ul:list-disc prose-ol:list-decimal prose-li:my-1",
        "prose-strong:text-gray-900 dark:prose-strong:text-white",
        "prose-hr:border-gray-200 dark:prose-hr:border-gray-700",
        className
      )}
    >
      {parts.map((part, index) => (
        part.type === 'code' ? (
          <CodeBlockViewer key={index} lang={part.lang!} code={part.content} />
        ) : (
          <div key={index} dangerouslySetInnerHTML={{ __html: part.content }} />
        )
      ))}
    </div>
  );
}
