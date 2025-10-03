// components/NoteItemMenu.tsx
// Hamburger menu for note/folder items
// LOC: ~90

"use client";

import { useState, useRef, useEffect } from "react";
import type { NoteItem } from "@/lib/types";

type Props = {
  item: NoteItem;
  onEdit: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function NoteItemMenu({ item, onEdit, onRename, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded hover:bg-[var(--surface-2)] transition-colors"
        aria-label="Options"
        aria-expanded={isOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="text-[var(--fg)]"
        >
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] shadow-elevated z-10 py-1">
          {item.type === "note" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onEdit);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onRename);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            <span>Rename</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDelete);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 text-red-600"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
