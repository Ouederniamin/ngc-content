"use client";

import { useState, useCallback } from "react";
import { RichTextEditor, RichTextViewer } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Loader2 } from "lucide-react";

interface EditableExerciseContentProps {
  exerciseId: number;
  initialContent: string | null;
  onSave?: (content: string) => void;
}

export function EditableExerciseContent({
  exerciseId,
  initialContent,
  onSave,
}: EditableExerciseContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      onSave?.(content);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [exerciseId, content, onSave]);

  const handleCancel = () => {
    setContent(initialContent || "");
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="group relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="bg-white dark:bg-gray-800"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        {content ? (
          <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 min-h-[100px]">
            <RichTextViewer content={content} />
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Click to add exercise content
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add text, code examples, instructions, and more
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Write your exercise content here... Add explanations, code examples, tips, and more."
        className="min-h-[300px]"
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
