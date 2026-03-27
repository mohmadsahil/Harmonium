"use client";

import { Music2, Volume2, Waves, ArrowUp, ArrowRightLeft, Layers3 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SCALE_ROOTS, type LabelSystem, type ModeSystem, type ScaleRoot } from "@/lib/music";

interface ControlsPanelProps {
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
  isRecording: boolean;
  isPlayingBack: boolean;
  onVolume: (value: number) => void;
  onReverb: (value: boolean) => void;
  onTranspose: (value: number) => void;
  onOctave: (value: number) => void;
  onReeds: (value: number) => void;
  onCoupler: (value: boolean) => void;
  onSustain: (value: boolean) => void;
  onTuning: (value: number) => void;
  onScaleRoot: (value: ScaleRoot) => void;
  onModeSystem: (value: ModeSystem) => void;
  onLabelSystem: (value: LabelSystem) => void;
  onTempo: (value: number) => void;
  onMetronome: (value: boolean) => void;
  onDrone: (value: boolean) => void;
  onMidi: (value: boolean) => void;
  onRecordToggle: () => void;
  onPlayback: () => void;
  onClearRecording: () => void;
}

export function ControlsPanel(props: ControlsPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <div className="mb-4 flex items-start gap-3">
          <Volume2 className="mt-1 h-5 w-5 text-amber-300" />
          <div>
            <CardTitle>Volume</CardTitle>
            <CardDescription>Instant audio level</CardDescription>
          </div>
        </div>
        <p className="mb-3 text-3xl font-semibold text-amber-300">{Math.round(props.volume * 100)}%</p>
        <Slider
          value={[props.volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => props.onVolume(value[0])}
        />
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <Waves className="mt-1 h-5 w-5 text-teal-300" />
          <div>
            <CardTitle>Reverb</CardTitle>
            <CardDescription>Spatial harmonium feel</CardDescription>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-teal-300">{props.reverb ? "ON" : "OFF"}</span>
          <Switch checked={props.reverb} onCheckedChange={props.onReverb} />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <Music2 className="mt-1 h-5 w-5 text-zinc-200" />
          <div>
            <CardTitle>MIDI</CardTitle>
            <CardDescription>External keyboard support</CardDescription>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-200">{props.midiDevices.length} Devices</p>
          <Switch checked={props.midiEnabled} onCheckedChange={props.onMidi} />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <ArrowRightLeft className="mt-1 h-5 w-5 text-amber-300" />
          <div>
            <CardTitle>Transpose</CardTitle>
            <CardDescription>Shift scale instantly</CardDescription>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <Button size="icon" variant="secondary" onClick={() => props.onTranspose(props.transpose - 1)}>
            -
          </Button>
          <p className="text-3xl font-semibold text-amber-300">
            {props.transpose > 0 ? `+${props.transpose}` : props.transpose}
          </p>
          <Button size="icon" variant="secondary" onClick={() => props.onTranspose(props.transpose + 1)}>
            +
          </Button>
        </div>
        <p className="mb-3 text-center text-sm text-zinc-300">Sa Root: {props.scaleRoot}</p>
        <Select value={props.scaleRoot} onValueChange={(value) => props.onScaleRoot(value as ScaleRoot)}>
          <SelectTrigger>
            <SelectValue placeholder="Scale" />
          </SelectTrigger>
          <SelectContent>
            {SCALE_ROOTS.map((root) => (
              <SelectItem key={root} value={root}>
                {root}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <ArrowUp className="mt-1 h-5 w-5 text-rose-300" />
          <div>
            <CardTitle>Octave</CardTitle>
            <CardDescription>Lower, middle, upper</CardDescription>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <Button size="icon" variant="secondary" onClick={() => props.onOctave(props.octaveShift - 1)}>
            -
          </Button>
          <p className="text-3xl font-semibold text-rose-300">{props.octaveShift + 3}</p>
          <Button size="icon" variant="secondary" onClick={() => props.onOctave(props.octaveShift + 1)}>
            +
          </Button>
        </div>
        <p className="text-center text-sm text-zinc-200">Middle</p>
      </Card>

      <Card>
        <div className="mb-4 flex items-start gap-3">
          <Layers3 className="mt-1 h-5 w-5 text-emerald-300" />
          <div>
            <CardTitle>Reeds</CardTitle>
            <CardDescription>Layered harmonium texture</CardDescription>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <Button size="icon" variant="secondary" onClick={() => props.onReeds(props.reeds - 1)}>
            -
          </Button>
          <p className="text-3xl font-semibold text-emerald-300">{props.reeds}</p>
          <Button size="icon" variant="secondary" onClick={() => props.onReeds(props.reeds + 1)}>
            +
          </Button>
        </div>
        <p className="text-center text-sm text-zinc-200">Layers</p>
      </Card>

      <Card className="md:col-span-2 xl:col-span-3">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="mb-2 text-sm text-zinc-300">Coupler</p>
            <Switch checked={props.coupler} onCheckedChange={props.onCoupler} />
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Sustain Airflow</p>
            <Switch checked={props.sustain} onCheckedChange={props.onSustain} />
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Metronome</p>
            <Switch checked={props.metronomeEnabled} onCheckedChange={props.onMetronome} />
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Tanpura Drone</p>
            <Switch checked={props.droneEnabled} onCheckedChange={props.onDrone} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="mb-2 text-sm text-zinc-300">Tuning ({props.tuningCents} cents)</p>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[props.tuningCents]}
              onValueChange={(value) => props.onTuning(value[0])}
            />
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Tempo ({props.tempo} BPM)</p>
            <Slider
              min={40}
              max={220}
              step={1}
              value={[props.tempo]}
              onValueChange={(value) => props.onTempo(value[0])}
            />
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Sargam Mode</p>
            <Select value={props.modeSystem} onValueChange={(value) => props.onModeSystem(value as ModeSystem)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hindustani">Hindustani</SelectItem>
                <SelectItem value="carnatic">Carnatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Label Style</p>
            <Select value={props.labelSystem} onValueChange={(value) => props.onLabelSystem(value as LabelSystem)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sargam">Sa Re Ga</SelectItem>
                <SelectItem value="western">C D E</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant={props.isRecording ? "secondary" : "default"} onClick={props.onRecordToggle}>
            {props.isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          <Button variant="outline" onClick={props.onPlayback} disabled={props.isPlayingBack}>
            {props.isPlayingBack ? "Playing..." : "Playback"}
          </Button>
          <Button variant="ghost" onClick={props.onClearRecording}>
            Clear Take
          </Button>
        </div>
      </Card>
    </div>
  );
}
