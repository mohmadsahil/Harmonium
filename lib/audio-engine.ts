import { type HarmoniumNote, getScaleRootSemitone, type ScaleRoot } from "@/lib/music";

export interface EngineSettings {
  volume: number;
  tuningCents: number;
  transpose: number;
  octaveShift: number;
  reeds: number;
  coupler: boolean;
  sustain: boolean;
  reverb: boolean;
  scaleRoot: ScaleRoot;
}

interface Voice {
  amp: GainNode;
  noiseGain: GainNode;
  noiseSource: AudioBufferSourceNode;
  lfo: OscillatorNode;
  oscillators: OscillatorNode[];
}

export class HarmoniumAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private voices = new Map<string, Voice>();
  private droneVoice: Voice | null = null;
  private harmoniumWave: PeriodicWave | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private targetVolume = 1;
  private reverbEnabled = true;

  private ensureContext(): AudioContext {
    if (this.context) {
      return this.context;
    }

    const context = new AudioContext({ latencyHint: "interactive" });
    const masterGain = context.createGain();
    const dryGain = context.createGain();
    const wetGain = context.createGain();
    const convolver = context.createConvolver();

    convolver.buffer = this.createImpulseResponse(context, 1.2);
    dryGain.connect(masterGain);
    wetGain.connect(convolver);
    convolver.connect(masterGain);
    masterGain.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.dryGain = dryGain;
    this.wetGain = wetGain;
    this.convolver = convolver;
    this.harmoniumWave = this.createHarmoniumWave(context);
    this.noiseBuffer = this.createNoiseBuffer(context, 0.45);

    this.setVolume(this.targetVolume);
    this.setReverb(this.reverbEnabled);
    return context;
  }

  async resume(): Promise<void> {
    const context = this.ensureContext();
    if (context.state === "suspended") {
      await context.resume();
    }
  }

  setVolume(value: number) {
    this.targetVolume = value;
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(value, this.context.currentTime, 0.02);
    }
  }

  setReverb(enabled: boolean) {
    this.reverbEnabled = enabled;
    if (this.wetGain && this.dryGain && this.context) {
      const now = this.context.currentTime;
      this.wetGain.gain.setTargetAtTime(enabled ? 0.2 : 0.02, now, 0.04);
      this.dryGain.gain.setTargetAtTime(enabled ? 0.88 : 0.98, now, 0.04);
    }
  }

  noteOn(note: HarmoniumNote, settings: EngineSettings) {
    const context = this.ensureContext();
    const now = context.currentTime;
    const key = note.id;

    if (this.voices.has(key)) {
      return;
    }

    const frequency = this.getAdjustedFrequency(note, settings);
    const amp = context.createGain();
    const bodyFilter = context.createBiquadFilter();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const noiseSource = context.createBufferSource();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = 3600 + settings.reeds * 700;
    bodyFilter.Q.value = 0.7;

    amp.gain.setValueAtTime(0.0001, now);
    amp.connect(bodyFilter);
    bodyFilter.connect(this.dryGain!);
    bodyFilter.connect(this.wetGain!);

    const oscillators = this.createOscillatorStack(context, frequency, settings.reeds);
    lfo.frequency.value = settings.sustain ? 5.3 : 4.4;
    lfoGain.gain.value = settings.sustain ? 3.2 : 1.4;
    lfo.connect(lfoGain);

    oscillators.forEach((oscillator) => {
      oscillator.connect(amp);
      lfoGain.connect(oscillator.detune);
      oscillator.start(now);
    });

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2200;
    noiseFilter.Q.value = 0.55;
    noiseGain.gain.setValueAtTime(settings.sustain ? 0.013 : 0.008, now);
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bodyFilter);
    noiseSource.start(now);

    const peak = 0.16 + settings.reeds * 0.026;
    amp.gain.exponentialRampToValueAtTime(peak, now + 0.018);
    if (!settings.sustain) {
      amp.gain.exponentialRampToValueAtTime(peak * 0.74, now + 0.22);
    }

    lfo.start(now);

    this.voices.set(key, {
      amp,
      noiseGain,
      noiseSource,
      lfo,
      oscillators,
    });

    if (settings.coupler) {
      const coupler = {
        ...note,
        frequency: note.frequency * 2,
        id: `${note.id}-coupler`,
      };
      this.noteOn(coupler, { ...settings, coupler: false, reeds: Math.max(0, settings.reeds - 1) });
    }
  }

  noteOff(noteId: string) {
    const context = this.context;
    if (!context) return;

    const stopVoice = (id: string) => {
      const voice = this.voices.get(id);
      if (!voice) return;

      const now = context.currentTime;
      voice.amp.gain.cancelScheduledValues(now);
      voice.amp.gain.setTargetAtTime(0.0001, now, 0.08);
      voice.noiseGain.gain.setTargetAtTime(0.0001, now, 0.06);

      voice.oscillators.forEach((oscillator) => {
        oscillator.stop(now + 0.22);
      });
      voice.lfo.stop(now + 0.22);
      voice.noiseSource.stop(now + 0.22);
      this.voices.delete(id);
    };

    stopVoice(noteId);
    stopVoice(`${noteId}-coupler`);
  }

  playMetronomeTick(accent = false) {
    const context = this.ensureContext();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "triangle";
    osc.frequency.value = accent ? 1320 : 980;
    gain.gain.value = accent ? 0.11 : 0.075;

    osc.connect(gain);
    gain.connect(this.masterGain!);

    const now = context.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  setDrone(enabled: boolean, baseFrequency: number) {
    const context = this.ensureContext();

    if (!enabled && this.droneVoice) {
      this.droneVoice.amp.gain.setTargetAtTime(0.0001, context.currentTime, 0.2);
      this.droneVoice.noiseGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.2);
      this.droneVoice.oscillators.forEach((osc) => osc.stop(context.currentTime + 0.3));
      this.droneVoice.noiseSource.stop(context.currentTime + 0.3);
      this.droneVoice.lfo.stop(context.currentTime + 0.3);
      this.droneVoice = null;
      return;
    }

    if (enabled && !this.droneVoice) {
      const amp = context.createGain();
      const bodyFilter = context.createBiquadFilter();
      const noiseFilter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      const noiseSource = context.createBufferSource();
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();

      amp.gain.value = 0.001;
      bodyFilter.type = "lowpass";
      bodyFilter.frequency.value = 3200;
      amp.connect(bodyFilter);
      bodyFilter.connect(this.dryGain!);
      bodyFilter.connect(this.wetGain!);

      const droneOsc1 = context.createOscillator();
      droneOsc1.frequency.value = baseFrequency;
      droneOsc1.type = "sine";
      const droneOsc2 = context.createOscillator();
      droneOsc2.frequency.value = baseFrequency * 1.5;
      droneOsc2.type = "triangle";

      lfo.frequency.value = 0.4;
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(droneOsc1.detune);
      lfoGain.connect(droneOsc2.detune);

      droneOsc1.connect(amp);
      droneOsc2.connect(amp);

      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1400;
      noiseFilter.Q.value = 0.3;
      noiseSource.buffer = this.noiseBuffer;
      noiseSource.loop = true;
      noiseGain.gain.value = 0.003;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(bodyFilter);

      droneOsc1.start();
      droneOsc2.start();
      noiseSource.start();
      lfo.start();

      amp.gain.setTargetAtTime(0.035, context.currentTime, 0.45);
      this.droneVoice = {
        amp,
        noiseGain,
        noiseSource,
        lfo,
        oscillators: [droneOsc1, droneOsc2],
      };
    }
  }

  stopAll() {
    const ids = [...this.voices.keys()];
    ids.forEach((id) => this.noteOff(id));
    if (this.droneVoice && this.context) {
      this.setDrone(false, 0);
    }
  }

  private getAdjustedFrequency(note: Pick<HarmoniumNote, "frequency">, settings: EngineSettings): number {
    const semitoneOffset =
      settings.transpose + settings.octaveShift * 12 + getScaleRootSemitone(settings.scaleRoot);
    const tuningMultiplier = 2 ** (settings.tuningCents / 1200);
    return note.frequency * 2 ** (semitoneOffset / 12) * tuningMultiplier;
  }

  private createOscillatorStack(context: AudioContext, frequency: number, reeds: number): OscillatorNode[] {
    const total = Math.max(2, reeds + 2);
    const detuneSpread = 6;

    return Array.from({ length: total }, (_, index) => {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (index - (total - 1) / 2) * detuneSpread;
      if (this.harmoniumWave) {
        oscillator.setPeriodicWave(this.harmoniumWave);
      } else {
        oscillator.type = "sawtooth";
      }
      return oscillator;
    });
  }

  private createHarmoniumWave(context: AudioContext): PeriodicWave {
    const harmonics = 12;
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);

    for (let i = 1; i <= harmonics; i += 1) {
      const brightFalloff = 1 / i;
      const reedWeight = i % 2 === 0 ? 0.58 : 1;
      imag[i] = brightFalloff * reedWeight;
    }

    return context.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  private createNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * seconds;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private createImpulseResponse(context: AudioContext, seconds: number): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * seconds;
    const impulse = context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const decay = (1 - i / length) ** 2;
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    return impulse;
  }
}
