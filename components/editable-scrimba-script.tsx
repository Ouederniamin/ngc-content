"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextViewer } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Loader2,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ScrimbaScript {
  id: number;
  title: string;
  content: string;
  style: string;
  isActive: boolean;
  variationNumber: number;
  generatedAt: string;
}

interface EditableScrimbaScriptProps {
  script: ScrimbaScript;
  onUpdate?: () => void;
}

export function EditableScrimbaScript({ script, onUpdate }: EditableScrimbaScriptProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetActive = useCallback(async () => {
    setIsSettingActive(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrimba-scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set as active");
      }

      onUpdate?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set active");
    } finally {
      setIsSettingActive(false);
    }
  }, [script.id, onUpdate, router]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrimba-scripts/${script.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete script");
      }

      onUpdate?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setIsDeleting(false);
    }
  }, [script.id, onUpdate, router]);

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        script.isActive
          ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-white">
            {script.title}
          </span>
          <Badge variant="outline" className="text-xs">
            {script.style}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Variation {script.variationNumber}
          </Badge>
          {script.isActive && (
            <Badge className="text-xs bg-green-600">Active</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(script.generatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className={`${isExpanded ? "" : "line-clamp-3"}`}>
        <RichTextViewer
          content={isExpanded ? script.content : script.content.substring(0, 500)}
          className="prose-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show More
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {!script.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetActive}
              disabled={isSettingActive}
            >
              {isSettingActive ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Set Active
            </Button>
          )}

          <Link href={`/dashboard/scrimba-scripts/${script.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
              <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Scrimba Script?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{script.title}". This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
