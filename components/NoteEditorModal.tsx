// components/NoteEditorModal.tsx
// Modal for editing note content and title
// LOC: ~80

"use client";

import { useState, useEffect } from "react";
import type { NoteItem } from "@/lib/types";

type Props = {
  note: NoteItem;
  onSave: (id: string, name: string, content: string) => void;
  onClose: () => void;
};

export default function NoteEditorModal({ note, onSave, onClose }: Props) {
  const [name, setName] = useState(note.name);
  const [content, setContent] = useState(note.content || "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [name, content]);

  const handleSave = () => {
    onSave(note.id, name.trim() || "Untitled Note", content);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-[var(--surface-1)] rounded-lg border border-[var(--border)] shadow-elevated flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-lg font-semibold bg-transparent border-none outline-none focus:ring-0"
            placeholder="Note title..."
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-4 px-2 py-1 text-xl text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Editor */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Start typing your note..."
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--surface-2)]">
          <div className="text-xs text-[var(--muted)]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)]">Esc</kbd> to close, 
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)]">Ctrl+S</kbd> to save
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded border border-[var(--accent)] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
