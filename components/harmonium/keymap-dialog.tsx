"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { HarmoniumNote } from "@/lib/music";

interface KeyMapDialogProps {
  notes: HarmoniumNote[];
  keyMap: Record<string, string>;
  onChange: (noteId: string, key: string) => void;
  onReset: () => void;
}

export function KeyMapDialog({ notes, keyMap, onChange, onReset }: KeyMapDialogProps) {
  const shownNotes = useMemo(() => notes.slice(0, 24), [notes]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Key Mapping
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Custom Keyboard Mapping</h3>
          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
        <p className="mb-4 text-sm text-zinc-300">
          Press one key per note for instant mapping. Settings are saved automatically.
        </p>
        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-2 md:grid-cols-3">
          {shownNotes.map((note) => (
            <label
              key={note.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="text-sm font-medium">{note.id}</span>
              <input
                value={keyMap[note.id] ?? ""}
                onChange={(event) => onChange(note.id, event.target.value.slice(-1))}
                className="w-12 rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-center text-sm outline-none focus:ring-2 focus:ring-amber-300"
                maxLength={1}
              />
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
