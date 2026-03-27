"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getDisplayLabel, type HarmoniumNote, type LabelSystem, type ModeSystem } from "@/lib/music";

interface KeyboardProps {
  notes: HarmoniumNote[];
  activeNotes: Record<string, boolean>;
  keyMap: Record<string, string>;
  labelSystem: LabelSystem;
  modeSystem: ModeSystem;
  onPress: (note: HarmoniumNote) => void;
  onRelease: (note: HarmoniumNote) => void;
}

export function Keyboard({
  notes,
  activeNotes,
  keyMap,
  labelSystem,
  modeSystem,
  onPress,
  onRelease,
}: KeyboardProps) {
  const [dragging, setDragging] = useState(false);
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  const whiteNotes = useMemo(() => notes.filter((note) => !note.isBlack), [notes]);
  const blackNotes = useMemo(() => notes.filter((note) => note.isBlack), [notes]);

  const handlePointerEnter = (note: HarmoniumNote) => {
    if (!dragging || lastPressed === note.id) return;
    if (lastPressed) {
      const previous = notes.find((entry) => entry.id === lastPressed);
      if (previous) onRelease(previous);
    }
    onPress(note);
    setLastPressed(note.id);
  };

  const endDrag = () => {
    setDragging(false);
    if (lastPressed) {
      const previous = notes.find((entry) => entry.id === lastPressed);
      if (previous) onRelease(previous);
    }
    setLastPressed(null);
  };

  return (
    <div
      className="relative mx-auto w-full overflow-x-auto rounded-2xl border border-white/20 bg-zinc-950/80 p-2 shadow-2xl"
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        if (dragging) endDrag();
      }}
    >
      <div className="relative min-w-230 select-none">
        <div className="flex">
          {whiteNotes.map((note) => {
            const pressed = Boolean(activeNotes[note.id]);
            return (
              <motion.button
                key={note.id}
                whileTap={{ scale: 0.98 }}
                onPointerDown={() => {
                  setDragging(true);
                  setLastPressed(note.id);
                  onPress(note);
                }}
                onPointerUp={() => {
                  onRelease(note);
                  setDragging(false);
                  setLastPressed(null);
                }}
                onPointerEnter={() => handlePointerEnter(note)}
                className={cn(
                  "relative h-52 w-14 border border-zinc-300/60 bg-linear-to-b from-zinc-50 to-zinc-200 text-zinc-800 transition-all",
                  pressed && "from-amber-200 to-amber-300 shadow-inner",
                )}
              >
                <span className="absolute bottom-11 left-1/2 -translate-x-1/2 text-[11px] font-semibold">
                  {getDisplayLabel(note, labelSystem, modeSystem)}
                </span>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-100">
                  {(keyMap[note.id] ?? "").toUpperCase()}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute left-0 top-0 h-0 w-full">
          {blackNotes.map((note) => {
            const index = whiteNotes.findIndex((w) => w.midi > note.midi) - 1;
            const left = Math.max(0, index) * 56 + 40;
            const pressed = Boolean(activeNotes[note.id]);
            return (
              <motion.button
                key={note.id}
                whileTap={{ scale: 0.98 }}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragging(true);
                  setLastPressed(note.id);
                  onPress(note);
                }}
                onPointerUp={() => {
                  onRelease(note);
                  setDragging(false);
                  setLastPressed(null);
                }}
                onPointerEnter={() => handlePointerEnter(note)}
                className={cn(
                  "pointer-events-auto absolute h-32 w-8.5 rounded-b-xl border border-zinc-700 bg-linear-to-b from-zinc-700 to-zinc-950 text-white",
                  pressed && "from-rose-500 to-rose-700",
                )}
                style={{ left }}
              >
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-semibold">
                  {(keyMap[note.id] ?? "").toUpperCase()}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
