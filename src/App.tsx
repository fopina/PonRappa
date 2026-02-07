import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';

// Web Audio API Synth implementation
class WebAudioSynth {
  private audioContext: AudioContext;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  triggerAttackRelease(note: string, duration: number = 0.3): void {
    // Resume audio context if suspended (needed for browser autoplay policies)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const frequency = this.noteToFrequency(note);
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // ADSR envelope (simple attack and release)
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, now + duration - 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    this.currentOscillator = oscillator;
    this.currentGain = gainNode;
  }

  dispose(): void {
    if (this.currentOscillator) {
      try {
        this.currentOscillator.stop();
      } catch (e) {
        // Oscillator may already be stopped
      }
    }
    this.audioContext.close();
  }
}

// Helper function to parse the notes from the URL anchor
function getNotesFromAnchor(): string[] {
  const anchor = window.location.hash;
  if (!anchor || !anchor.startsWith('#m=')) {
    return [];
  }
  return anchor.substring(3).split(',');
}

// Helper function to generate a random song
function generateRandomSong(): string[] {
  const availableNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  const songLength = 8 + Math.floor(Math.random() * 9); // 8-16 notes
  const randomNotes: string[] = [];

  for (let i = 0; i < songLength; i++) {
    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    randomNotes.push(availableNotes[randomIndex]);
  }

  return randomNotes;
}

// Main App component
function App() {
  const [notes, setNotes] = useState<string[]>(getNotesFromAnchor());
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
  const currentNoteIndex = useRef<number>(0);
  const synth = useRef<WebAudioSynth>(new WebAudioSynth());

  useEffect(() => {
    const handleHashChange = () => {
      setNotes(getNotesFromAnchor());
      currentNoteIndex.current = 0;
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      synth.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (isButtonPressed) {
      if (notes.length === 0) return;
      const note = notes[currentNoteIndex.current % notes.length];
      synth.current.triggerAttackRelease(note, 0.3);
      currentNoteIndex.current++;

      const interval = setInterval(() => {
        if (!isButtonPressed) {
          clearInterval(interval);
          return;
        }
        const note = notes[currentNoteIndex.current % notes.length];
        synth.current.triggerAttackRelease(note, 0.3);
        currentNoteIndex.current++;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isButtonPressed, notes]);

  const handleButtonDown = () => {
    setIsButtonPressed(true);
  };

  const handleButtonUp = () => {
    setIsButtonPressed(false);
  };

  const handleGenerateRandom = () => {
    const randomNotes = generateRandomSong();
    window.location.hash = `#m=${randomNotes.join(',')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        gap: '16px',
        touchAction: 'manipulation',
      }}
    >
      <button
        onMouseDown={handleButtonDown}
        onMouseUp={handleButtonUp}
        onTouchStart={handleButtonDown}
        onTouchEnd={handleButtonUp}
        disabled={notes.length === 0}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Play Notes
      </button>
      <button
        onClick={handleGenerateRandom}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Generate Random Song
      </button>
    </div>
  );
}

export default App;
