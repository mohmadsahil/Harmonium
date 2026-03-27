export type ModeSystem = "hindustani" | "carnatic";
export type LabelSystem = "sargam" | "western";

export type ScaleRoot =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export interface HarmoniumNote {
  id: string;
  midi: number;
  octave: number;
  frequency: number;
  isBlack: boolean;
  western: string;
  sargamHindustani: string;
  sargamCarnatic: string;
}

const WESTERN_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const SARGAM_HINDUSTANI = [
  "Sa",
  "Re(k)",
  "Re",
  "Ga(k)",
  "Ga",
  "Ma",
  "Ma(t)",
  "Pa",
  "Dha(k)",
  "Dha",
  "Ni(k)",
  "Ni",
] as const;

const SARGAM_CARNATIC = [
  "Sa",
  "Ri1",
  "Ri2",
  "Ga2",
  "Ga3",
  "Ma1",
  "Ma2",
  "Pa",
  "Da1",
  "Da2",
  "Ni2",
  "Ni3",
] as const;

export const SCALE_ROOTS: ScaleRoot[] = [...WESTERN_NOTES];

export const TRANSPOSE_LIMIT = 12;
export const OCTAVE_LIMIT = 2;
export const REEDS_LIMIT = 3;

export const DEFAULT_KEY_SEQUENCE = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
  "'",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  ",",
  ".",
  "/",
  "q",
  "2",
  "r",
  "5",
  "6",
  "7",
  "9",
  "0",
] as const;

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function getScaleRootSemitone(root: ScaleRoot): number {
  return WESTERN_NOTES.indexOf(root);
}

export function createHarmoniumNotes(startMidi = 48, count = 36): HarmoniumNote[] {
  return Array.from({ length: count }, (_, index) => {
    const midi = startMidi + index;
    const semitone = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const western = WESTERN_NOTES[semitone];
    const id = `${western}${octave}`;

    return {
      id,
      midi,
      octave,
      frequency: midiToFrequency(midi),
      isBlack: western.includes("#"),
      western,
      sargamHindustani: SARGAM_HINDUSTANI[semitone],
      sargamCarnatic: SARGAM_CARNATIC[semitone],
    };
  });
}

export function getDisplayLabel(
  note: HarmoniumNote,
  labelSystem: LabelSystem,
  modeSystem: ModeSystem,
): string {
  if (labelSystem === "western") {
    return note.western;
  }

  return modeSystem === "hindustani"
    ? note.sargamHindustani
    : note.sargamCarnatic;
}

export function createDefaultKeyMap(notes: HarmoniumNote[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  notes.forEach((note, index) => {
    if (index < DEFAULT_KEY_SEQUENCE.length) {
      mapping[note.id] = DEFAULT_KEY_SEQUENCE[index];
    }
  });

  return mapping;
}

export function getNoteByKeyboardKey(
  notes: HarmoniumNote[],
  keyMap: Record<string, string>,
  key: string,
): HarmoniumNote | undefined {
  const lower = key.toLowerCase();
  return notes.find((note) => keyMap[note.id] === lower);
}
