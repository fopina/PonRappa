export type SoundType = 'trumpet' | 'sine' | 'square' | 'sawtooth';

// Web Audio API Synth implementation
export class WebAudioSynth {
  private audioContext: AudioContext;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private soundType: SoundType = 'trumpet';

  constructor(soundType: SoundType = 'trumpet') {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.soundType = soundType;
  }

  setSoundType(type: SoundType): void {
    this.soundType = type;
  }

  // Convert note name to frequency (e.g., "C4" -> 261.63 Hz)
  private noteToFrequency(note: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    const match = note.match(/^([A-G]#?|[A-G]b?)(\d+)$/);
    if (!match) return 440; // Default to A4

    const noteName = match[1];
    const octave = parseInt(match[2]);
    const noteNumber = noteMap[noteName];

    // A4 = 440 Hz, calculate from there
    const a4 = 440;
    const halfStepsFromA4 = (octave - 4) * 12 + (noteNumber - 9);
    return a4 * Math.pow(2, halfStepsFromA4 / 12);
  }

  // Start playing a note continuously
  startNote(note: string): void {
    // Stop any currently playing note first
    this.stopNote();

    // Resume audio context if suspended (needed for browser autoplay policies)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const frequency = this.noteToFrequency(note);
    const now = this.audioContext.currentTime;

    if (this.soundType === 'trumpet') {
      this.startTrumpetNote(frequency, now);
    } else {
      this.startBasicNote(frequency, now, this.soundType);
    }
  }

  private startBasicNote(frequency: number, now: number, waveType: OscillatorType): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = waveType;
    oscillator.frequency.value = frequency;

    // Quick attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // 50ms attack

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);

    this.currentOscillator = oscillator;
    this.currentGain = gainNode;
  }

  private startTrumpetNote(frequency: number, now: number): void {
    // Trumpet-like sound using sawtooth wave with filtered harmonics
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Use sawtooth for rich harmonics (brass-like)
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;

    // Low-pass filter to shape the tone (removes harsh high frequencies)
    filter.type = 'lowpass';
    filter.frequency.value = frequency * 3; // Cutoff at 3x fundamental
    filter.Q.value = 1.5; // Some resonance for brightness

    // Trumpet-like ADSR envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02); // Fast attack (20ms)
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.1); // Slight decay
    // Sustain at 0.35 until release

    // Connect: oscillator -> filter -> gain -> destination
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);

    this.currentOscillator = oscillator;
    this.currentGain = gainNode;
  }

  // Stop the currently playing note
  stopNote(): void {
    if (this.currentOscillator && this.currentGain) {
      const now = this.audioContext.currentTime;
      // Quick release
      this.currentGain.gain.cancelScheduledValues(now);
      this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
      this.currentGain.gain.linearRampToValueAtTime(0, now + 0.05); // 50ms release

      // Stop the oscillator after the release
      this.currentOscillator.stop(now + 0.05);
      this.currentOscillator = null;
      this.currentGain = null;
    }
  }

  dispose(): void {
    this.stopNote();
    this.audioContext.close();
  }
}
