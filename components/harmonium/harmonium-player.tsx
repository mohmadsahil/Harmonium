"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Sun, Headphones } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/harmonium/controls-panel";
import { Keyboard } from "@/components/harmonium/keyboard";
import { KeyMapDialog } from "@/components/harmonium/keymap-dialog";
import {
  createHarmoniumNotes,
  getNoteByKeyboardKey,
  OCTAVE_LIMIT,
  REEDS_LIMIT,
  TRANSPOSE_LIMIT,
} from "@/lib/music";
import { useHarmoniumStore } from "@/store/harmonium-store";
import { EngineSettings, HarmoniumAudioEngine } from "@/lib/audio-engine";

const notes = createHarmoniumNotes();

export function HarmoniumPlayer() {
  const state = useHarmoniumStore();
  const audioEngine = useRef(new HarmoniumAudioEngine());
  const pressedByKeyboard = useRef(new Set<string>());
  const playbackTimers = useRef<number[]>([]);
  const metronomeStep = useRef(0);
  const settingsRef = useRef<EngineSettings | null>(null);
  const storeRef = useRef(state);
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const engineSettings = useMemo(
    () => ({
      volume: state.volume,
      transpose: state.transpose,
      octaveShift: state.octaveShift,
      tuningCents: state.tuningCents,
      reeds: state.reeds,
      coupler: state.coupler,
      sustain: state.sustain,
      reverb: state.reverb,
      scaleRoot: state.scaleRoot,
    }),
    [
      state.volume,
      state.transpose,
      state.octaveShift,
      state.tuningCents,
      state.reeds,
      state.coupler,
      state.sustain,
      state.reverb,
      state.scaleRoot,
    ],
  );

  const notesById = useMemo(() => new Map(notes.map((note) => [note.id, note])), []);

  useEffect(() => {
    settingsRef.current = engineSettings;
    storeRef.current = state;
  }, [engineSettings, state]);

  const playNote = useCallback(async (noteId: string) => {
    const note = notesById.get(noteId);
    if (!note) return;
    if (!settingsRef.current) return;

    await audioEngine.current.resume();
    audioEngine.current.noteOn(note, settingsRef.current);
    storeRef.current.noteOn(note.id);
    storeRef.current.addEvent({ type: "on", noteId: note.id });
  }, [notesById]);

  const releaseNote = useCallback((noteId: string) => {
    audioEngine.current.noteOff(noteId);
    storeRef.current.noteOff(noteId);
    storeRef.current.addEvent({ type: "off", noteId });
  }, []);

  useEffect(() => {
    audioEngine.current.setVolume(state.volume);
    audioEngine.current.setReverb(state.reverb);
  }, [state.volume, state.reverb]);

  useEffect(() => {
    const base = notes[0]?.frequency ?? 130.81;
    const semitone = state.transpose + state.octaveShift * 12;
    audioEngine.current.setDrone(state.droneEnabled, base * 2 ** (semitone / 12));
  }, [state.droneEnabled, state.transpose, state.octaveShift]);

  useEffect(() => {
    if (!state.metronomeEnabled) return;

    const duration = (60 / state.tempo) * 1000;
    const interval = window.setInterval(() => {
      const accent = metronomeStep.current % 4 === 0;
      audioEngine.current.playMetronomeTick(accent);
      metronomeStep.current += 1;
    }, duration);

    return () => window.clearInterval(interval);
  }, [state.metronomeEnabled, state.tempo]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.repeat || event.target instanceof HTMLInputElement) return;

      const note = getNoteByKeyboardKey(notes, state.keyMap, event.key);
      if (!note) return;
      if (pressedByKeyboard.current.has(note.id)) return;

      pressedByKeyboard.current.add(note.id);
      await playNote(note.id);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = getNoteByKeyboardKey(notes, state.keyMap, event.key);
      if (!note) return;

      pressedByKeyboard.current.delete(note.id);
      releaseNote(note.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.keyMap, playNote, releaseNote]);

  useEffect(() => {
    if (!state.midiEnabled || !navigator.requestMIDIAccess) return;

    let access: MIDIAccess | null = null;
    const listeners = new Map<MIDIInput, (event: MIDIMessageEvent) => void>();

    navigator.requestMIDIAccess().then((midiAccess) => {
      access = midiAccess;
      const devices = [...midiAccess.inputs.values()].map((input) => input.name ?? "MIDI Device");
      storeRef.current.setMidiDevices(devices);

      midiAccess.inputs.forEach((input) => {
        const listener = (event: MIDIMessageEvent) => {
          if (!event.data || event.data.length < 3) return;
          const [status, midiNote, velocity] = event.data;
          const note = notes.find((item) => item.midi === midiNote);
          if (!note) return;

          const command = status & 0xf0;
          if (command === 0x90 && velocity > 0) {
            void playNote(note.id);
          }
          if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            releaseNote(note.id);
          }
        };
        input.addEventListener("midimessage", listener);
        listeners.set(input, listener);
      });
    });

    return () => {
      listeners.forEach((listener, input) => input.removeEventListener("midimessage", listener));
      if (access) {
        storeRef.current.setMidiDevices([]);
      }
    };
  }, [state.midiEnabled, playNote, releaseNote]);

  useEffect(() => {
    const engine = audioEngine.current;
    return () => {
      engine.stopAll();
      playbackTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const playRecording = () => {
    if (!state.recordedEvents.length) return;
    state.setPlayingBack(true);

    playbackTimers.current.forEach((timer) => window.clearTimeout(timer));
    playbackTimers.current = state.recordedEvents.map((event) =>
      window.setTimeout(() => {
        if (event.type === "on") {
          void playNote(event.noteId);
        } else {
          releaseNote(event.noteId);
        }
      }, event.at),
    );

    const end = window.setTimeout(
      () => {
        state.setPlayingBack(false);
      },
      state.recordedEvents[state.recordedEvents.length - 1]?.at + 400,
    );
    playbackTimers.current.push(end);
  };

  const currentTheme = resolvedTheme ?? theme;
  const isDarkTheme = currentTheme === "dark";
  const toggleTheme = () => {
    const nextTheme = (resolvedTheme ?? theme) === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <div className="relative">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="bg-linear-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            Virtual Harmonium Player
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-200 md:text-base">
            Play instantly with mouse, touch, keyboard, or MIDI. No setup needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/learn-harmonium">
              Learn Harmonium
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/ragas-library">
              Ragas Library
            </Link>
          </Button>
          {/* <Button
            variant="secondary"
            size="icon"
            aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {mounted && isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button> */}
        </div>
      </header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Keyboard
          notes={notes}
          activeNotes={state.activeNotes}
          keyMap={state.keyMap}
          labelSystem={state.labelSystem}
          modeSystem={state.modeSystem}
          onPress={(note) => {
            void playNote(note.id);
          }}
          onRelease={(note) => releaseNote(note.id)}
        />
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-zinc-200">
          <Headphones className="h-4 w-4" />
          Tip: best experience with headphones for spatial reverb and drone.
        </p>
        <KeyMapDialog
          notes={notes}
          keyMap={state.keyMap}
          onChange={state.setKeyMapping}
          onReset={state.resetKeyMap}
        />
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <ControlsPanel
          volume={state.volume}
          reverb={state.reverb}
          transpose={state.transpose}
          octaveShift={state.octaveShift}
          reeds={state.reeds}
          coupler={state.coupler}
          sustain={state.sustain}
          tuningCents={state.tuningCents}
          scaleRoot={state.scaleRoot}
          modeSystem={state.modeSystem}
          labelSystem={state.labelSystem}
          tempo={state.tempo}
          metronomeEnabled={state.metronomeEnabled}
          droneEnabled={state.droneEnabled}
          midiEnabled={state.midiEnabled}
          midiDevices={state.midiDevices}
          isRecording={state.isRecording}
          isPlayingBack={state.isPlayingBack}
          onVolume={state.setVolume}
          onReverb={state.setReverb}
          onTranspose={(value) =>
            state.setTranspose(Math.max(-TRANSPOSE_LIMIT, Math.min(TRANSPOSE_LIMIT, value)))
          }
          onOctave={(value) => state.setOctaveShift(Math.max(-OCTAVE_LIMIT, Math.min(OCTAVE_LIMIT, value)))}
          onReeds={(value) => state.setReeds(Math.max(0, Math.min(REEDS_LIMIT, value)))}
          onCoupler={state.setCoupler}
          onSustain={state.setSustain}
          onTuning={state.setTuningCents}
          onScaleRoot={state.setScaleRoot}
          onModeSystem={state.setModeSystem}
          onLabelSystem={state.setLabelSystem}
          onTempo={state.setTempo}
          onMetronome={state.setMetronomeEnabled}
          onDrone={state.setDroneEnabled}
          onMidi={state.setMidiEnabled}
          onRecordToggle={() => (state.isRecording ? state.stopRecording() : state.startRecording())}
          onPlayback={playRecording}
          onClearRecording={state.clearRecording}
        />
      </motion.div>
    </div>
  );
}
