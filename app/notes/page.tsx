// app/notes/page.tsx
// Notes page with Windows-style folder/file grid view
// LOC: ~250

"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/id";
import type { NoteItem } from "@/lib/types";
import NoteEditorModal from "@/components/NoteEditorModal";
import NoteItemMenu from "@/components/NoteItemMenu";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import Logo from "@/images/logo/logo.png";

export default function NotesPage() {
  const { notes, loadNotes, addNote, updateNote, deleteNote } = useAppStore();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Get current folder path for breadcrumbs
  const getFolderPath = (folderId: string | null): NoteItem[] => {
    if (!folderId) return [];
    const path: NoteItem[] = [];
    let current = notes.find((n) => n.id === folderId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? notes.find((n) => n.id === current!.parentId) : undefined;
    }
    return path;
  };

  // Get items in current folder
  const currentItems = notes.filter((n) => n.parentId === currentFolderId);
  const folderPath = getFolderPath(currentFolderId);

  const handleCreateFolder = () => {
    const name = prompt("Folder name:");
    if (!name?.trim()) return;
    const folder: NoteItem = {
      id: uid("folder"),
      type: "folder",
      name: name.trim(),
      parentId: currentFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addNote(folder);
  };

  const handleCreateNote = () => {
    const note: NoteItem = {
      id: uid("note"),
      type: "note",
      name: "Untitled Note",
      parentId: currentFolderId,
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addNote(note);
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleOpenItem = (item: NoteItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else {
      setEditingNote(item);
      setShowEditor(true);
    }
  };

  const handleSaveNote = (id: string, name: string, content: string) => {
    updateNote(id, { name, content });
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleDeleteItem = (item: NoteItem) => {
    const confirmMsg = item.type === "folder" 
      ? "Delete this folder and all its contents?" 
      : "Delete this note?";
    if (!confirm(confirmMsg)) return;
    deleteNote(item.id);
  };

  const handleRename = (item: NoteItem) => {
    const newName = prompt("Rename:", item.name);
    if (!newName?.trim() || newName === item.name) return;
    updateNote(item.id, { name: newName.trim() });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col border border-[var(--border)] rounded-lg bg-[var(--surface-1)] shadow-subtle relative">
          {/* Top bar with brand mark and controls */}
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[var(--border)] rounded-t-lg">
            <div className="flex items-center gap-2">
              <Image
                src={Logo}
                alt="Eeko logo"
                width={22}
                height={22}
                className="opacity-90 [filter:invert(41%)_sepia(89%)_saturate(1468%)_hue-rotate(191deg)_brightness(93%)_contrast(92%)]"
                priority
              />
              <span className="text-sm font-medium text-[var(--fg)]/85">Eeko</span>
              <span className="text-[10px] font-normal text-[var(--fg)]/35">v.22</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle view button */}
              <button
                type="button"
                aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
                title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="inline-flex items-center justify-center h-9 px-2 py-0 rounded-md border border-[var(--border)] bg-[var(--surface-1)] text-[var(--fg)]/90 hover:bg-[var(--surface-2)] shadow-subtle"
              >
                {viewMode === "grid" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M3 5.25A.75.75 0 0 1 3.75 4.5h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 6.75A.75.75 0 0 1 3.75 11.25h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h4.5A1.5 1.5 0 0 1 10.5 4.5v4.5A1.5 1.5 0 0 1 9 10.5H4.5A1.5 1.5 0 0 1 3 9V4.5Zm10.5 0A1.5 1.5 0 0 1 15 3h4.5A1.5 1.5 0 0 1 21 4.5v4.5A1.5 1.5 0 0 1 19.5 10.5H15A1.5 1.5 0 0 1 13.5 9V4.5ZM3 15A1.5 1.5 0 0 1 4.5 13.5h4.5A1.5 1.5 0 0 1 10.5 15v4.5A1.5 1.5 0 0 1 9 21H4.5A1.5 1.5 0 0 1 3 19.5V15Zm10.5 0A1.5 1.5 0 0 1 15 13.5h4.5A1.5 1.5 0 0 1 21 15v4.5A1.5 1.5 0 0 1 19.5 21H15a1.5 1.5 0 0 1-1.5-1.5V15Z" />
                  </svg>
                )}
              </button>
              {/* Add folder button */}
              <button
                type="button"
                aria-label="Add folder"
                title="Add folder"
                onClick={handleCreateFolder}
                className="inline-flex items-center justify-center h-9 px-2 py-0 rounded-md border border-[var(--border)] bg-[var(--surface-1)] text-[var(--fg)]/90 hover:bg-[var(--surface-2)] shadow-subtle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                  <path d="M19.5 21a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-5.379a1.5 1.5 0 0 1-1.06-.44l-2.122-2.12A3 3 0 0 0 8.818 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15ZM12 10.5a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 12 10.5Z" />
                </svg>
              </button>
              {/* Add note button */}
              <button
                type="button"
                aria-label="Add note"
                title="Add note"
                onClick={handleCreateNote}
                className="inline-flex items-center justify-center h-9 px-2 py-0 rounded-md border border-[var(--border)] bg-[var(--surface-1)] text-[var(--fg)]/90 hover:bg-[var(--surface-2)] shadow-subtle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>
              </button>
              {/* Mobile-only hamburger */}
              <div className="md:hidden">
                <Sidebar variant="top" />
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] text-sm">
            <button
              onClick={() => setCurrentFolderId(null)}
              className="text-[var(--accent)] hover:underline"
            >
              Root
            </button>
            {folderPath.map((folder) => (
              <span key={folder.id} className="flex items-center gap-2">
                <span className="text-[var(--muted)]">/</span>
                <button
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="text-[var(--accent)] hover:underline"
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>

          {/* Items Grid/List */}
          <div className="flex-1 overflow-y-auto p-3">
        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <p>No items in this folder</p>
            <p className="text-xs mt-2">Create a folder or note to get started</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col items-center p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                onClick={() => handleOpenItem(item)}
              >
                {/* Menu Button */}
                <div className="absolute top-2 right-2">
                  <NoteItemMenu
                    item={item}
                    onEdit={() => handleOpenItem(item)}
                    onRename={() => handleRename(item)}
                    onDelete={() => handleDeleteItem(item)}
                  />
                </div>

                {/* Icon */}
                <div className="text-4xl mb-2">
                  {item.type === "folder" ? "📁" : "📄"}
                </div>
                
                {/* Name */}
                <div className="text-sm text-center break-words w-full line-clamp-2">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                onClick={() => handleOpenItem(item)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.type === "folder" ? "📁" : "📄"}</span>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <NoteItemMenu
                  item={item}
                  onEdit={() => handleOpenItem(item)}
                  onRename={() => handleRename(item)}
                  onDelete={() => handleDeleteItem(item)}
                />
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && editingNote && (
        <NoteEditorModal
          note={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}
