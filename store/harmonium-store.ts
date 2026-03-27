import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  createDefaultKeyMap,
  createHarmoniumNotes,
  type LabelSystem,
  type ModeSystem,
  type ScaleRoot,
} from "@/lib/music";

export interface NoteEvent {
  type: "on" | "off";
  noteId: string;
  at: number;
}

const notes = createHarmoniumNotes();

interface HarmoniumState {
  volume: number;
  reverb: boolean;
  transpose: number;
  octaveShift: number;
  reeds: number;
  coupler: boolean;
  sustain: boolean;
  tuningCents: number;
  scaleRoot: ScaleRoot;
  modeSystem: ModeSystem;
  labelSystem: LabelSystem;
  tempo: number;
  metronomeEnabled: boolean;
  droneEnabled: boolean;
  midiEnabled: boolean;
  midiDevices: string[];
  activeNotes: Record<string, boolean>;
  isRecording: boolean;
  recordingStartedAt: number;
  recordedEvents: NoteEvent[];
  keyMap: Record<string, string>;
  isPlayingBack: boolean;
  setVolume: (value: number) => void;
  setReverb: (value: boolean) => void;
  setTranspose: (value: number) => void;
  setOctaveShift: (value: number) => void;
  setReeds: (value: number) => void;
  setCoupler: (value: boolean) => void;
  setSustain: (value: boolean) => void;
  setTuningCents: (value: number) => void;
  setScaleRoot: (value: ScaleRoot) => void;
  setModeSystem: (value: ModeSystem) => void;
  setLabelSystem: (value: LabelSystem) => void;
  setTempo: (value: number) => void;
  setMetronomeEnabled: (value: boolean) => void;
  setDroneEnabled: (value: boolean) => void;
  setMidiEnabled: (value: boolean) => void;
  setMidiDevices: (devices: string[]) => void;
  noteOn: (noteId: string) => void;
  noteOff: (noteId: string) => void;
  allNotesOff: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  addEvent: (event: Omit<NoteEvent, "at">) => void;
  setPlayingBack: (value: boolean) => void;
  setKeyMapping: (noteId: string, key: string) => void;
  resetKeyMap: () => void;
}

export const useHarmoniumStore = create<HarmoniumState>()(
  persist(
    (set, get) => ({
      volume: 1,
      reverb: true,
      transpose: 0,
      octaveShift: 0,
      reeds: 0,
      coupler: false,
      sustain: false,
      tuningCents: 0,
      scaleRoot: "C",
      modeSystem: "hindustani",
      labelSystem: "sargam",
      tempo: 90,
      metronomeEnabled: false,
      droneEnabled: false,
      midiEnabled: false,
      midiDevices: [],
      activeNotes: {},
      isRecording: false,
      recordingStartedAt: 0,
      recordedEvents: [],
      keyMap: createDefaultKeyMap(notes),
      isPlayingBack: false,
      setVolume: (value) => set({ volume: value }),
      setReverb: (value) => set({ reverb: value }),
      setTranspose: (value) => set({ transpose: value }),
      setOctaveShift: (value) => set({ octaveShift: value }),
      setReeds: (value) => set({ reeds: value }),
      setCoupler: (value) => set({ coupler: value }),
      setSustain: (value) => set({ sustain: value }),
      setTuningCents: (value) => set({ tuningCents: value }),
      setScaleRoot: (value) => set({ scaleRoot: value }),
      setModeSystem: (value) => set({ modeSystem: value }),
      setLabelSystem: (value) => set({ labelSystem: value }),
      setTempo: (value) => set({ tempo: value }),
      setMetronomeEnabled: (value) => set({ metronomeEnabled: value }),
      setDroneEnabled: (value) => set({ droneEnabled: value }),
      setMidiEnabled: (value) => set({ midiEnabled: value }),
      setMidiDevices: (midiDevices) => set({ midiDevices }),
      noteOn: (noteId) =>
        set((state) => ({
          activeNotes: { ...state.activeNotes, [noteId]: true },
        })),
      noteOff: (noteId) =>
        set((state) => {
          const next = { ...state.activeNotes };
          delete next[noteId];
          return { activeNotes: next };
        }),
      allNotesOff: () => set({ activeNotes: {} }),
      startRecording: () =>
        set({
          isRecording: true,
          recordingStartedAt: Date.now(),
          recordedEvents: [],
        }),
      stopRecording: () => set({ isRecording: false }),
      clearRecording: () => set({ recordedEvents: [] }),
      addEvent: (event) => {
        const state = get();
        if (!state.isRecording) return;

        const at = Date.now() - state.recordingStartedAt;
        set({
          recordedEvents: [...state.recordedEvents, { ...event, at }],
        });
      },
      setPlayingBack: (value) => set({ isPlayingBack: value }),
      setKeyMapping: (noteId, key) =>
        set((state) => ({
          keyMap: {
            ...state.keyMap,
            [noteId]: key.toLowerCase(),
          },
        })),
      resetKeyMap: () => set({ keyMap: createDefaultKeyMap(notes) }),
    }),
    {
      name: "harmonium-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        reverb: state.reverb,
        transpose: state.transpose,
        octaveShift: state.octaveShift,
        reeds: state.reeds,
        coupler: state.coupler,
        sustain: state.sustain,
        tuningCents: state.tuningCents,
        scaleRoot: state.scaleRoot,
        modeSystem: state.modeSystem,
        labelSystem: state.labelSystem,
        tempo: state.tempo,
        metronomeEnabled: state.metronomeEnabled,
        droneEnabled: state.droneEnabled,
        keyMap: state.keyMap,
      }),
    },
  ),
);
